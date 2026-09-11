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
      // Direct relay from fan to creator dashboard to bypass REST API latency/issues
      io.to(`creator_${creatorId}`).emit('chat_cancelled_by_fan', { sessionId });
      io.emit('chat-session-ended', { creatorId, sessionId });
      
      // Failsafe: forcefully update the database via socket in case the HTTP request failed
      try {
        await ChatSession.updateOne(
          { _id: sessionId },
          { $set: { status: 'ended', endTime: new Date(), cancelledByFan: true } }
        );
      } catch (err) {
        console.error('Socket DB update failed', err);
      }
    });

    socket.on('join_chat', async ({ sessionId, role, userId }) => {
      const room = sessionId.toString();
      socket.join(room);
      console.log(`${role} ${userId} joined chat session ${room}`);

      // Notify fan that creator has joined, but wait for fan to accept before starting billing
      if (role === 'creator') {
        io.to(room).emit('creator_joined');
        
        try {
          const session = await ChatSession.findById(sessionId);
          if (session) {
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
          console.error('Failed to save creator joined message', err);
        }
      }
    });

    socket.on('fan_accepted', async ({ sessionId }) => {
      const room = sessionId.toString();
      const session = await ChatSession.findById(sessionId);
      if (session && session.status === 'active' && !activeChatTimers.has(room)) {
        // Reset start time so billing begins from when fan accepted
        session.startTime = new Date();
        await session.save();
        io.to(room).emit('fan_accepted', { startTime: session.startTime });
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
            console.log(`Insufficient balance for session ${sessionId}, pausing chat for up to 3 mins...`);
            // Pause chat instead of ending immediately
            clearInterval(interval);
            activeChatTimers.delete(sessionId);
            
            io.to(sessionId.toString()).emit('fan_recharging_pause');

            // Set 3 minute grace period timeout
            const pauseTimeout = setTimeout(async () => {
              if (pausedChatTimers.has(sessionId)) {
                pausedChatTimers.delete(sessionId);
                await endChatSession(sessionId, io, 'INSUFFICIENT_BALANCE');
              }
            }, 180000); // 3 minutes

            pausedChatTimers.set(sessionId, pauseTimeout);
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

        session.status = 'ended';
        session.endTime = new Date();
        await session.save();

        io.to(sessionId.toString()).emit('chat_ended', { 
          totalMinutes: session.totalMinutes,
          totalCost: session.totalCost,
          reason
        });

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
