const ChatSession = require('../models/ChatSession');
const Fan = require('../models/Fan');
const Creator = require('../models/Creator');
const WalletTransaction = require('../models/WalletTransaction');

module.exports = (io) => {
  // Store active timers to clear them when chat ends
  const activeChatTimers = new Map();
  // Store pause timers (grace periods) to end chat if fan doesn't recharge in time
  const pausedChatTimers = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected to socket:', socket.id);

    socket.on('join_creator_room', ({ creatorId }) => {
      socket.join(`creator_${creatorId}`);
      console.log(`Creator ${creatorId} joined their alert room.`);
    });

    socket.on('fan_cancelled_request', async ({ sessionId, creatorId }) => {
      const sidStr = (sessionId || '').toString();
      const cidStr = (creatorId || '').toString();
      let fidStr = '';
      let fanName = '';
      
      try {
        const session = await ChatSession.findById(sessionId).populate('fanId', 'name');
        if (session) {
          fidStr = (session.fanId?._id || session.fanId || '').toString();
          fanName = session.fanId?.name || '';
          await ChatSession.updateMany(
            { creatorId: session.creatorId, fanId: session.fanId, status: 'active' },
            { $set: { status: 'ended', endTime: new Date(), cancelledByFan: true, creatorJoined: true } }
          );
        } else {
          await ChatSession.updateOne(
            { _id: sessionId },
            { $set: { status: 'ended', endTime: new Date(), cancelledByFan: true, creatorJoined: true } }
          );
        }
      } catch (err) {
        console.error('Socket DB update failed on fan cancel', err);
      }

      const payload = { sessionId: sidStr, creatorId: cidStr, fanId: fidStr, fanName };
      if (cidStr) {
        io.to(`creator_${cidStr}`).emit('chat_cancelled_by_fan', payload);
        io.to(`creator_${cidStr}`).emit('chat_ended', payload);
      }
      io.emit('chat-session-ended', payload);
      io.emit('chat_ended', payload);
    });

    socket.on('creator_declined', async ({ sessionId, creatorId }) => {
      const sidStr = (sessionId || '').toString();
      const cidStr = (creatorId || '').toString();
      let fidStr = '';
      let fanName = '';

      try {
        const session = await ChatSession.findById(sessionId).populate('fanId', 'name');
        if (session) {
          fidStr = (session.fanId?._id || session.fanId || '').toString();
          fanName = session.fanId?.name || '';
          await ChatSession.updateMany(
            { creatorId: session.creatorId, fanId: session.fanId, status: 'active' },
            { $set: { status: 'ended', endTime: new Date(), cancelledByFan: true, creatorJoined: true } }
          );
        } else {
          await ChatSession.updateOne(
            { _id: sessionId },
            { $set: { status: 'ended', endTime: new Date(), cancelledByFan: true, creatorJoined: true } }
          );
        }
      } catch (err) {
        console.error('Socket DB update failed on creator decline', err);
      }

      const payload = { sessionId: sidStr, creatorId: cidStr, fanId: fidStr, fanName, reason: 'CREATOR_DECLINED' };
      io.to(sidStr).emit('creator_declined', payload);
      io.to(sidStr).emit('chat_ended', payload);
      if (cidStr) {
        io.to(`creator_${cidStr}`).emit('chat_cancelled_by_fan', payload);
        io.to(`creator_${cidStr}`).emit('chat_ended', payload);
      }
      io.emit('chat-session-ended', payload);
      io.emit('chat_ended', payload);
    });

    socket.on('join_chat', async ({ sessionId, role, userId }) => {
      const room = sessionId.toString();
      socket.join(room);
      if (userId) {
        socket.join(`fan_${userId.toString()}`);
        socket.join(`user_${userId.toString()}`);
      }
      console.log(`${role} ${userId} joined chat session ${room}`);

      // Notify fan that creator has joined, but wait for fan to accept before starting billing
      if (role === 'creator') {
        let joinedAt = new Date();
        let cidStr = '';
        let fidStr = '';
        try {
          const session = await ChatSession.findById(sessionId);
          if (session) {
            cidStr = session.creatorId ? session.creatorId.toString() : '';
            fidStr = session.fanId ? session.fanId.toString() : '';

            await ChatSession.updateOne(
              { _id: session._id, status: 'active' },
              { $set: { creatorJoined: true, creatorJoinedAt: joinedAt } }
            );
            session.creatorJoined = true;
            session.creatorJoinedAt = joinedAt;

            const Message = require('../models/Message');
            // Check if we already added a joined message to prevent duplicates
            const existing = await Message.findOne({ sessionId, senderRole: 'system', content: { $regex: 'has joined' } });
            if (!existing) {
              const msg = new Message({
                messageId: 'sys_' + Date.now().toString(),
                sessionId,
                creatorId: session.creatorId,
                fanId: session.fanId,
                senderRole: 'system',
                content: 'The creator has joined the chat.',
                sentAt: new Date(),
                isAutomated: true
              });
              await msg.save();
              io.to(room).emit('receive_message', JSON.parse(JSON.stringify(msg.toObject())));
            }
          }
        } catch (err) {
          console.error('Failed to update creator joined status/message', err);
        }

        const payload = {
          sessionId: sessionId.toString(),
          creatorId: cidStr,
          fanId: fidStr,
          creatorJoinedAt: joinedAt
        };

        io.to(room).emit('creator_joined', payload);
        if (cidStr) io.to(`creator_${cidStr}`).emit('creator_joined', payload);
        if (fidStr) io.to(`fan_${fidStr}`).emit('creator_joined', payload);
        io.emit('creator_joined', payload);
      }
    });

    socket.on('fan_accepted', async ({ sessionId }) => {
      const room = sessionId.toString();
      const session = await ChatSession.findById(sessionId);
      if (session && session.status === 'active' && !activeChatTimers.has(room)) {
        // Reset start time so billing begins from when fan accepted
        session.startTime = new Date();
        session.fanAccepted = true;
        session.fanAcceptedAt = new Date();
        await session.save();
        const payload = { startTime: session.startTime, sessionId: session._id.toString() };
        io.to(room).emit('fan_accepted', payload);
        if (session.creatorId) {
          io.to(`creator_${session.creatorId.toString()}`).emit('fan_accepted', payload);
        }
        io.emit('fan_accepted', payload);
        startWalletDeductionTimer(room, io);
        
        try {
          const Message = require('../models/Message');
          const existing = await Message.findOne({ sessionId, senderRole: 'system', content: { $regex: 'has accepted' } });
          if (!existing) {
            const msg = new Message({
              messageId: 'sys_' + Date.now().toString(),
              sessionId,
              creatorId: session.creatorId,
              fanId: session.fanId,
              senderRole: 'system',
              content: 'The fan has accepted the chat.',
              sentAt: new Date(),
              isAutomated: true
            });
            await msg.save();
            io.to(room).emit('receive_message', JSON.parse(JSON.stringify(msg.toObject())));
          }
        } catch (err) {
          console.error('Failed to save fan accepted message', err);
        }
      }
    });

    socket.on('send_message', async ({ sessionId, sender, content, tempId }) => {
      try {
        const session = await ChatSession.findById(sessionId);
        if (!session || session.status !== 'active') {
          return socket.emit('chat_error', { message: 'Chat session is not active' });
        }

        const Message = require('../models/Message');
        const sentAt = new Date(); // Enforce server timestamp
        
        const message = new Message({
          messageId: tempId || Date.now().toString(),
          sessionId,
          creatorId: session.creatorId,
          fanId: session.fanId,
          senderRole: sender,
          content,
          sentAt,
          deliveredAt: null,
          readAt: null
        });
        await message.save();

        const messageData = JSON.parse(JSON.stringify(message.toObject()));
        io.to(sessionId.toString()).emit('receive_message', messageData);
        // Fallback global emit just in case room joining failed
        // io.emit('receive_message', messageData);
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('chat_error', { message: 'Message delivery failed: ' + err.message });
      }
    });

    socket.on('message_delivered', async ({ messageId, sessionId }) => {
      try {
        const Message = require('../models/Message');
        const msg = await Message.findOneAndUpdate(
          { messageId },
          { $set: { deliveredAt: new Date() } },
          { new: true }
        );
        if (msg) {
          socket.to(sessionId).emit('message_status_update', msg);
        }
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('message_read', async ({ messageId, sessionId }) => {
      try {
        const Message = require('../models/Message');
        const msg = await Message.findOneAndUpdate(
          { messageId, readAt: null },
          { $set: { readAt: new Date(), deliveredAt: new Date() } },
          { new: true }
        );
        if (msg) {
          socket.to(sessionId).emit('message_status_update', msg);
        }
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('react_message', async ({ messageId, sessionId, emoji, senderRole }) => {
      try {
        const Message = require('../models/Message');
        const msg = await Message.findOne({ messageId });
        if (msg) {
          // Add or update reaction
          const existingReactionIndex = msg.reactions?.findIndex(r => r.senderRole === senderRole);
          if (existingReactionIndex >= 0) {
            msg.reactions[existingReactionIndex].emoji = emoji;
          } else {
            msg.reactions = msg.reactions || [];
            msg.reactions.push({ emoji, senderRole });
          }
          await msg.save();
          io.to(sessionId).emit('message_reacted', { messageId, emoji, senderRole });
        }
      } catch (e) {
        console.error('Error adding reaction:', e);
      }
    });

    socket.on('typing', ({ sessionId, sender }) => {
      socket.to(sessionId).emit('typing', { sender });
    });

    socket.on('stop_typing', ({ sessionId, sender }) => {
      socket.to(sessionId).emit('stop_typing', { sender });
    });
    
    socket.on('presence_update', ({ sessionId, sender, status }) => {
      socket.to(sessionId).emit('presence_update', { sender, status });
    });

    socket.on('end_chat', async ({ sessionId }) => {
      await endChatSession(sessionId, io);
    });

    socket.on('wallet_recharged', ({ sessionId }) => {
      console.log(`Wallet recharged for session ${sessionId}, resuming chat...`);
      if (pausedChatTimers.has(sessionId)) {
        clearTimeout(pausedChatTimers.get(sessionId));
        pausedChatTimers.delete(sessionId);
      }
      
      // Update session status back if needed, though it should still be 'active'
      startWalletDeductionTimer(sessionId, io);
      io.to(sessionId.toString()).emit('wallet_recharged');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from socket:', socket.id);
      // NOTE: Presence disconnected can be inferred here if we tracked socket -> sessionId mapping
    });
  });

  async function startWalletDeductionTimer(sessionId, io) {
    console.log(`Starting wallet deduction timer for session: ${sessionId}`);
    
    // Check if it's a free chat first
    const initSession = await ChatSession.findById(sessionId);
    if (initSession && initSession.isFreeChat) {
      console.log(`Setting 2-minute strict timeout for free chat ${sessionId}`);
      const timeout = setTimeout(async () => {
        console.log(`Free chat session ${sessionId} reached 2 minute limit, ending automatically.`);
        await endChatSession(sessionId, io, 'FREE_TRIAL_ENDED');
        activeChatTimers.delete(sessionId);
      }, 120000); // exactly 2 minutes
      activeChatTimers.set(sessionId, timeout);
      return; // Skip the interval completely for free chats
    }

    const interval = setInterval(async () => {
      try {
        const session = await ChatSession.findById(sessionId);
        if (!session || session.status !== 'active') {
          clearInterval(interval);
          activeChatTimers.delete(sessionId);
          return;
        }

        const fan = await Fan.findById(session.fanId);
        const creator = await Creator.findById(session.creatorId);

        if (!fan || !creator) return;

        const rate = session.ratePerMinute;
        
        // Calculate exact total cost that SHOULD have been paid by now
        const elapsedSeconds = (Date.now() - session.startTime.getTime()) / 1000;
        
        const expectedTotalCost = (elapsedSeconds / 60) * rate;
        
        // The amount we need to deduct right now is the difference between what should have been paid and what was already paid
        const amountToDeduct = expectedTotalCost - session.totalCost;

        if (amountToDeduct > 0) {
          if (fan.walletBalance < amountToDeduct) {
            console.log(`Insufficient balance for session ${sessionId}, ending chat immediately...`);
            clearInterval(interval);
            activeChatTimers.delete(sessionId);
            await endChatSession(sessionId, io, 'INSUFFICIENT_BALANCE');
            return;
          }

          // Deduct balance
          fan.walletBalance -= amountToDeduct;
          await fan.save();

          // Update session
          session.totalMinutes = elapsedSeconds / 60;
          session.totalCost += amountToDeduct;
          await session.save();

          // Record transaction
          const tx = new WalletTransaction({
            fanId: session.fanId,
            creatorId: session.creatorId,
            amount: amountToDeduct,
            type: 'debit',
            reference: sessionId,
            status: 'completed',
            description: 'Live Chat auto charge'
          });
          await tx.save();
        }
        
        // Emit live wallet update to the fan
        io.to(sessionId.toString()).emit('wallet_update', { balance: fan.walletBalance });

        // Notify room of low balance warning (if under 3 mins left)
        const currentMinsLeft = fan.walletBalance / rate;
        if (currentMinsLeft < 3) {
          io.to(sessionId.toString()).emit('low_balance_warning', {
            minutesRemaining: Math.floor(currentMinsLeft)
          });
        }
      } catch (error) {
        console.error('Error in wallet deduction interval:', error);
      }
    }, 60000); // Run every 60 seconds

    activeChatTimers.set(sessionId, interval);
  }

  async function endChatSession(sessionId, io, reason = null) {
    try {
      const session = await ChatSession.findById(sessionId);
      if (session && session.status === 'active') {
        if (activeChatTimers.has(sessionId)) {
          const timer = activeChatTimers.get(sessionId);
          clearInterval(timer);
          clearTimeout(timer);
          activeChatTimers.delete(sessionId);
        }
        const fan = await Fan.findById(session.fanId);
        if (fan && session.startTime) {
          if (session.isFreeChat) {
            fan.hasUsedFreeChat = true;
            await fan.save();
          }
          
          const rate = session.ratePerMinute;
          const elapsedSeconds = (Date.now() - session.startTime.getTime()) / 1000;
          const expectedTotalCost = (elapsedSeconds / 60) * rate;
          let amountToDeduct = expectedTotalCost - session.totalCost;
          
          if (amountToDeduct > 0) {
            // If they don't have enough to cover the final fraction, just take whatever they have left
            if (fan.walletBalance < amountToDeduct) {
              amountToDeduct = fan.walletBalance;
            }
            
            fan.walletBalance -= amountToDeduct;
            await fan.save();
            
            session.totalCost += amountToDeduct;
            session.totalMinutes = elapsedSeconds / 60;
            
            const tx = new WalletTransaction({
              fanId: session.fanId,
              creatorId: session.creatorId,
              amount: amountToDeduct,
              type: 'debit',
              reference: sessionId,
              status: 'completed',
              description: 'Live Chat final charge'
            });
            await tx.save();
            
            io.to(sessionId.toString()).emit('wallet_update', { balance: fan.walletBalance });
          }
        }

        // Terminate all active sessions between this creator and this fan in DB
        await ChatSession.updateMany(
          { creatorId: session.creatorId, fanId: session.fanId, status: 'active' },
          { 
            $set: { 
              status: 'ended', 
              creatorJoined: true, 
              cancelledByFan: true, 
              endTime: new Date(),
              totalMinutes: session.totalMinutes || 0,
              totalCost: session.totalCost || 0
            } 
          }
        );

        session.status = 'ended';
        session.creatorJoined = true;
        session.cancelledByFan = true;
        session.endTime = new Date();
        await session.save();

        const sidStr = session._id.toString();
        const cidStr = session.creatorId ? session.creatorId.toString() : '';
        const fidStr = session.fanId ? session.fanId.toString() : '';
        const fanName = fan?.name || '';

        const endPayload = {
          sessionId: sidStr,
          fanId: fidStr,
          fanName: fanName,
          creatorId: cidStr,
          totalMinutes: session.totalMinutes,
          totalCost: session.totalCost,
          reason
        };

        io.to(sidStr).emit('chat_ended', endPayload);

        if (cidStr) {
          io.to(`creator_${cidStr}`).emit('chat_ended', endPayload);
          io.to(`creator_${cidStr}`).emit('chat_cancelled_by_fan', endPayload);
        }
        io.emit('chat-session-ended', endPayload);
        io.emit('chat_ended', endPayload);

        // Clear timers
        if (activeChatTimers.has(sessionId)) {
          clearInterval(activeChatTimers.get(sessionId));
          activeChatTimers.delete(sessionId);
        }
        if (pausedChatTimers.has(sessionId)) {
          clearTimeout(pausedChatTimers.get(sessionId));
          pausedChatTimers.delete(sessionId);
        }
        console.log(`Chat session ended: ${sessionId}`);
      }
    } catch (err) {
      console.error('Error ending chat session:', err);
    }
  }
};
