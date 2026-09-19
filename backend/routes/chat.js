const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const Fan = require('../models/Fan');
const Creator = require('../models/Creator');
const WalletTransaction = require('../models/WalletTransaction');
const Counter = require('../models/Counter');
const { verifyFanToken, verifyCreatorToken, verifyFanOrCreatorToken } = require('../middleware/auth');

// POST /api/chat/start
router.post('/start', verifyFanToken, async (req, res) => {
  try {
    const { creatorId, isContinueChat, previousSessionId } = req.body;
    
    const creator = await Creator.findById(creatorId);
    if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });

    const fan = await Fan.findById(req.fan.fanId);
    if (!fan) return res.status(404).json({ success: false, message: 'Fan not found' });


    // We allow the chat to start if they are either manually live OR they have configured time slots
    // Since the frontend performs precise IST calculations, we trust the frontend's initialization
    if (!creator.isLive && (!creator.liveChatTimeSlots || creator.liveChatTimeSlots.length === 0)) {
      return res.status(400).json({ success: false, message: 'Creator is not live right now' });
    }


    // Check minimum balance (must have at least 5 minutes worth)
    let rate = creator.liveChatPrice || 5;
    let isFreeChat = false;

    // Continue chat is always a paid continuation requiring 5 mins balance
    if (!fan.hasUsedFreeChat && !isContinueChat) {
      isFreeChat = true;
      rate = 0; // It's free!
    }

    if (!isFreeChat && fan.walletBalance < rate * 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance to start a chat. You need at least 5 minutes worth of balance.',
        required: rate * 5,
        balance: fan.walletBalance
      });
    }

    // Cleanly terminate any prior active sessions between this creator and fan
    await ChatSession.updateMany(
      { creatorId: creator._id, fanId: fan._id, status: 'active' },
      { $set: { status: 'ended', endTime: new Date(), cancelledByFan: true } }
    );

    const counter = await Counter.findOneAndUpdate(
      { _id: 'chatId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const newChatId = String(counter.seq).padStart(13, '0');

    const session = new ChatSession({
      creatorId: creator._id,
      fanId: fan._id,
      ratePerMinute: rate,
      isFreeChat: isFreeChat,
      isContinueChat: !!isContinueChat,
      status: 'active',
      chatId: newChatId,
      startTime: new Date(),
      createdAt: new Date(),
      creatorJoined: false,
      creatorJoinedAt: null,
      fanAccepted: false,
      fanAcceptedAt: null
    });
    await session.save();

    // If this is a continue chat, carry over conversation messages
    if (isContinueChat) {
      const Message = require('../models/Message');
      let sourceMessages = [];

      // 1. If explicit previousSessionId was provided, check it first
      if (previousSessionId) {
        try {
          const prevMsgs = await Message.find({
            sessionId: previousSessionId,
            senderRole: { $in: ['fan', 'creator'] }
          }).sort({ sentAt: 1 });
          if (prevMsgs && prevMsgs.length > 0) {
            sourceMessages = prevMsgs;
          }
        } catch (e) {
          console.error('Error finding messages by previousSessionId:', e);
        }
      }

      // 2. If not found, look through previous sessions for this creator and fan, newest first
      if (sourceMessages.length === 0) {
        const candidateSessions = await ChatSession.find({
          creatorId: creator._id,
          fanId: fan._id,
          _id: { $ne: session._id }
        }).sort({ startTime: -1, _id: -1 }).limit(10);

        for (const cand of candidateSessions) {
          const msgs = await Message.find({
            sessionId: cand._id,
            senderRole: { $in: ['fan', 'creator'] }
          }).sort({ sentAt: 1 });
          if (msgs && msgs.length > 0) {
            sourceMessages = msgs;
            break;
          }
        }
      }

      // 3. Fallback: Search the Message collection directly for the latest conversation message between this pair
      if (sourceMessages.length === 0) {
        const lastMsg = await Message.findOne({
          creatorId: creator._id,
          fanId: fan._id,
          sessionId: { $ne: session._id },
          senderRole: { $in: ['fan', 'creator'] }
        }).sort({ sentAt: -1, _id: -1 });

        if (lastMsg && lastMsg.sessionId) {
          sourceMessages = await Message.find({
            sessionId: lastMsg.sessionId,
            senderRole: { $in: ['fan', 'creator'] }
          }).sort({ sentAt: 1 });
        }
      }

      // Copy previous conversation messages into the new session
      if (sourceMessages.length > 0) {
        const newMessages = sourceMessages.map(m => ({
          messageId: 'cont_' + (m.messageId ? m.messageId.replace(/^cont_/, '') : Date.now()) + '_' + Math.random().toString(36).slice(2, 8),
          sessionId: session._id,
          creatorId: creator._id,
          fanId: fan._id,
          senderRole: m.senderRole,
          content: m.content,
          sentAt: m.sentAt || new Date(),
          deliveredAt: m.deliveredAt || null,
          readAt: m.readAt || null,
          reactions: (m.reactions || []).map(r => ({ emoji: r.emoji, senderRole: r.senderRole }))
        }));
        await Message.insertMany(newMessages);
      }
    }

    // Fetch first page of messages (last 50)
    const Message = require('../models/Message');
    const messages = await Message.find({ sessionId: session._id })
      .sort({ sentAt: -1 })
      .limit(50);
    
    // Sort ascending for frontend display
    messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

    const startTimeIso = (session.startTime || new Date()).toISOString();

    // Notify creator via socket
    if (req.io) {
      req.io.to(`creator_${creator._id.toString()}`).emit('incoming_chat_request', {
        sessionId: session._id.toString(),
        fanId: fan._id.toString(),
        fanName: fan.name || 'A Fan',
        fanAvatarUrl: fan.avatarUrl || null,
        rate,
        time: startTimeIso,
        walletBalance: fan.walletBalance || 0,
        isContinueChat: !!session.isContinueChat
      });
    }

    res.json({ 
      success: true, 
      sessionId: session._id, 
      chatId: session.chatId, 
      rate, 
      isFreeChat, 
      isContinueChat: !!session.isContinueChat,
      messages, 
      time: startTimeIso,
      creatorJoined: session.creatorJoined || false,
      creatorJoinedAt: session.creatorJoinedAt || null
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/chat/fan-accept
router.post('/fan-accept', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Missing sessionId' });
    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status !== 'active') return res.status(400).json({ success: false, message: 'Session is not active' });

    session.startTime = new Date();
    session.fanAccepted = true;
    session.fanAcceptedAt = new Date();
    await session.save();

    if (req.io) {
      const room = sessionId.toString();
      req.io.to(room).emit('fan_accepted', { startTime: session.startTime });
      if (session.creatorId) {
        req.io.to(`creator_${session.creatorId.toString()}`).emit('fan_accepted', { sessionId: session._id.toString(), startTime: session.startTime });
      }
      req.io.emit('fan_accepted', { sessionId: session._id.toString(), startTime: session.startTime });
    }

    res.json({ success: true, startTime: session.startTime });
  } catch (err) {
    console.error('Error in fan-accept:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/chat/end
router.post('/end', async (req, res) => {
  try {
    const { sessionId, cancelBeforeStart, reason } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Missing sessionId' });
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const sidStr = session._id.toString();
    const cidStr = session.creatorId ? session.creatorId.toString() : '';
    const fidStr = session.fanId ? session.fanId.toString() : '';

    if (session.status !== 'active') {
      // Failsafe: Ensure DB guarantees all sessions for this creator & fan are ended
      await ChatSession.updateMany(
        { creatorId: session.creatorId, fanId: session.fanId, status: 'active' },
        { 
          $set: { 
            status: 'ended', 
            creatorJoined: true, 
            cancelledByFan: true, 
            endTime: session.endTime || new Date() 
          } 
        }
      );

      const fanDoc = await Fan.findById(session.fanId);
      const fanName = fanDoc?.name || '';

      // ALWAYS broadcast end event to creator room to dismiss from dashboard immediately!
      if (req.io) {
        const endPayload = {
          sessionId: sidStr,
          fanId: fidStr,
          fanName,
          creatorId: cidStr,
          totalMinutes: session.totalMinutes || 0,
          totalCost: session.totalCost || 0,
          reason: reason || 'USER_ENDED'
        };

        if (cidStr) {
          req.io.to(`creator_${cidStr}`).emit('chat_cancelled_by_fan', endPayload);
          req.io.to(`creator_${cidStr}`).emit('chat_ended', endPayload);
        }
        req.io.to(sessionId.toString()).emit('chat_ended', endPayload);
        req.io.emit('chat-session-ended', endPayload);
        req.io.emit('chat_ended', endPayload);
      }

      return res.json({ success: true, message: 'Session already ended', totalMinutes: session.totalMinutes || 0, totalCost: session.totalCost || 0 });
    }
    
    const fan = await Fan.findById(session.fanId);
    if (fan && session.startTime && !cancelBeforeStart) {
      const rate = session.ratePerMinute;
      const elapsedSeconds = (Date.now() - session.startTime.getTime()) / 1000;
      const expectedTotalCost = (elapsedSeconds / 60) * rate;
      let amountToDeduct = expectedTotalCost - (session.totalCost || 0);
      
      if (session.isFreeChat) {
        fan.hasUsedFreeChat = true;
        await fan.save();
      }

      if (amountToDeduct > 0) {
        if (fan.walletBalance < amountToDeduct) {
          amountToDeduct = fan.walletBalance;
        }
        
        fan.walletBalance -= amountToDeduct;
        await fan.save();
        
        session.totalCost = (session.totalCost || 0) + amountToDeduct;
        session.totalMinutes = elapsedSeconds / 60;
        
        const tx = new WalletTransaction({
          fanId: fan._id,
          creatorId: session.creatorId,
          amount: amountToDeduct,
          type: 'debit',
          reference: session._id,
          status: 'completed',
          description: 'Live Chat final charge (manual end)'
        });
        await tx.save();
      } else {
        session.totalMinutes = elapsedSeconds / 60;
      }
    } else {
      session.totalMinutes = 0;
      session.totalCost = 0;
    }

    const updateFields = {
      status: 'ended',
      endTime: new Date(),
      creatorJoined: true, // Guarantees this session is permanently excluded from active pending query
      cancelledByFan: true,
      totalMinutes: session.totalMinutes,
      totalCost: session.totalCost
    };

    // Terminate all active sessions between this creator and this fan
    await ChatSession.updateMany(
      { creatorId: session.creatorId, fanId: session.fanId, status: 'active' },
      { $set: updateFields }
    );
    session.status = 'ended';
    session.creatorJoined = true;
    session.cancelledByFan = true;

    const fanName = fan?.name || '';

    if (req.io) {
      const endPayload = {
        sessionId: sidStr,
        fanId: fidStr,
        fanName,
        creatorId: cidStr,
        totalMinutes: session.totalMinutes,
        totalCost: session.totalCost,
        reason: reason || 'USER_ENDED'
      };

      req.io.to(sessionId.toString()).emit('chat_ended', endPayload);
      // Notify creator dashboard immediately
      if (cidStr) {
        const creatorRoom = `creator_${cidStr}`;
        req.io.to(creatorRoom).emit('chat_cancelled_by_fan', endPayload);
        req.io.to(creatorRoom).emit('chat_ended', endPayload);
      }
      req.io.emit('chat-session-ended', endPayload);
      req.io.emit('chat_ended', endPayload);
    }

    res.json({ success: true, totalMinutes: session.totalMinutes, totalCost: session.totalCost });
  } catch (error) {
    console.error('Error ending chat:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/chat/creator-accept
router.post('/creator-accept', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Missing sessionId' });
    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status !== 'active') return res.status(400).json({ success: false, message: 'Session already ended' });

    const joinedAt = new Date();

    // Mark only this specific session as creatorJoined: true
    await ChatSession.updateOne(
      { _id: session._id, status: 'active' },
      { $set: { creatorJoined: true, creatorJoinedAt: joinedAt } }
    );
    session.creatorJoined = true;
    session.creatorJoinedAt = joinedAt;

    const Message = require('../models/Message');
    const existingMsg = await Message.findOne({ sessionId: session._id, senderRole: 'system', content: { $regex: 'has joined' } });
    let joinMsgDoc = null;
    if (!existingMsg) {
      joinMsgDoc = new Message({
        messageId: 'sys_' + Date.now().toString(),
        sessionId: session._id,
        creatorId: session.creatorId,
        fanId: session.fanId,
        senderRole: 'system',
        content: 'The creator has joined the chat.',
        sentAt: joinedAt,
        isAutomated: true
      });
      await joinMsgDoc.save();
    }

    const sidStr = session._id.toString();
    const cidStr = session.creatorId ? session.creatorId.toString() : '';
    const fidStr = session.fanId ? session.fanId.toString() : '';

    if (req.io) {
      const payload = {
        sessionId: sidStr,
        creatorId: cidStr,
        fanId: fidStr,
        creatorJoinedAt: joinedAt
      };

      req.io.to(sidStr).emit('creator_joined', payload);
      if (cidStr) req.io.to(`creator_${cidStr}`).emit('creator_joined', payload);
      if (fidStr) req.io.to(`fan_${fidStr}`).emit('creator_joined', payload);
      req.io.emit('creator_joined', payload);

      if (joinMsgDoc) {
        const msgObj = JSON.parse(JSON.stringify(joinMsgDoc.toObject()));
        req.io.to(sidStr).emit('receive_message', msgObj);
        req.io.emit('receive_message', msgObj);
      }
    }

    res.json({
      success: true,
      creatorJoined: true,
      creatorJoinedAt: joinedAt,
      sessionId: sidStr
    });
  } catch (err) {
    console.error('Error accepting chat by creator:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/chat/active/:creatorId
router.get('/active/:creatorId', verifyFanToken, async (req, res) => {
  try {
    const fanId = req.fan ? (req.fan.fanId || req.fan.id) : null;
    if (!fanId) return res.status(403).json({ success: false, message: 'Not authorized as fan' });
    const session = await ChatSession.findOne({
      creatorId: req.params.creatorId,
      fanId: fanId,
      status: 'active'
    }).sort({ updatedAt: -1 });
    if (!session) return res.json({ success: false, message: 'No active session' });
    res.json({ success: true, session });
  } catch (err) {
    console.error('Error fetching active chat session:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// GET /api/chat/fan-history
router.get('/fan-history', verifyFanToken, async (req, res) => {
  try {
    const fanId = req.fan.fanId;
    if (!fanId) return res.status(403).json({ success: false, message: 'Not authorized as fan' });

    const sessions = await ChatSession.find({
      fanId: fanId,
      status: 'ended',
      totalMinutes: { $gt: 0 },
      deletedByFan: { $ne: true }
    })
    .populate('creatorId', 'name avatarUrl handle')
    .sort({ startTime: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching fan chat history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/chat/:sessionId/history
router.delete('/:sessionId/history', verifyFanToken, async (req, res) => {
  try {
    const fanId = req.fan ? (req.fan.fanId || req.fan.id) : null;
    if (!fanId) return res.status(403).json({ success: false, message: 'Not authorized as fan' });

    const session = await ChatSession.findOne({ _id: req.params.sessionId, fanId: fanId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    await ChatSession.updateOne({ _id: session._id }, { $set: { deletedByFan: true } });

    res.json({ success: true, message: 'Chat history deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/chat/creator-history
router.get('/creator-history', verifyCreatorToken, async (req, res) => {
  try {
    const creatorId = req.creator ? (req.creator.creatorId || req.creator.id) : null;
    if (!creatorId) return res.status(403).json({ success: false, message: 'Not authorized as creator' });

    const sessions = await ChatSession.find({
      creatorId: creatorId,
      status: 'ended'
    })
    .populate('fanId', 'name avatarUrl handle')
    .sort({ endTime: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching creator chat history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/chat/notify-missed
router.post('/notify-missed', verifyCreatorToken, async (req, res) => {
  try {
    const creatorId = req.creator ? (req.creator.creatorId || req.creator.id) : null;
    const { fanId, sessionId } = req.body;
    
    if (!creatorId || !fanId) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const Notification = require('../models/Notification');
    const Creator = require('../models/Creator');
    const ChatSession = require('../models/ChatSession');
    
    const creator = await Creator.findById(creatorId);
    
    if (sessionId) {
      await ChatSession.findByIdAndUpdate(sessionId, { notifiedMissed: true });
    }

    const notif = new Notification({
      fanId: fanId,
      title: 'Creator Available!',
      message: `Your favorite creator, ${creator.name}, is now available! Go and start chatting right away!`,
      isRead: false,
      actionUrl: `/${creator.handle || creator._id}`
    });
    
    await notif.save();
    
    res.json({ success: true, message: 'Notification sent successfully' });
  } catch (err) {
    console.error('Error notifying missed chat:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/chat/pending
router.get('/pending', verifyCreatorToken, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const creatorId = req.creator ? (req.creator.creatorId || req.creator.id) : null;
    if (!creatorId) return res.status(403).json({ success: false, message: 'Not authorized as creator' });

    const activeSessions = await ChatSession.find({
      creatorId: creatorId,
      status: 'active',
      creatorJoined: { $ne: true },
      cancelledByFan: { $ne: true },
      fanAccepted: { $ne: true },
      $or: [{ endTime: null }, { endTime: { $exists: false } }]
    }).populate('fanId', 'name avatarUrl walletBalance');

    const pendingChats = [];
    const now = Date.now();
    
    for (const session of activeSessions) {
      const chatTime = session.startTime || session.createdAt || session.updatedAt;
      const isExpired = !chatTime || (now - new Date(chatTime).getTime() > 120000);
      const fanActualId = session.fanId?._id || session.fanId;

      if (isExpired || session.status !== 'active' || session.creatorJoined || session.cancelledByFan || session.endTime) {
         session.status = 'ended';
         session.creatorJoined = true;
         session.cancelledByFan = true;
         session.totalMinutes = session.totalMinutes || 0;
         session.totalCost = session.totalCost || 0;
         session.endTime = session.endTime || new Date();
         await session.save();
         continue; 
      }
      pendingChats.push({
        sessionId: session._id.toString(),
        fanId: (fanActualId || '').toString(),
        fanName: session.fanId?.name || 'A Fan',
        fanAvatarUrl: session.fanId?.avatarUrl || null,
        rate: session.ratePerMinute,
        time: chatTime ? new Date(chatTime).toISOString() : new Date().toISOString(),
        walletBalance: session.fanId?.walletBalance || 0,
        isContinueChat: !!session.isContinueChat
      });
    }

    res.json({ success: true, pendingChats });
  } catch (error) {
    console.error('Error fetching pending chats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/chat/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId)
      .populate('creatorId', 'name handle avatarUrl isLive')
      .populate('fanId', 'name avatarUrl walletBalance');
    
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    // Fetch first page of messages (last 50)
    const Message = require('../models/Message');
    const messages = await Message.find({ sessionId: session._id })
      .sort({ sentAt: -1 })
      .limit(50);
    
    // Sort ascending for frontend display
    messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    
    const sessionObj = session.toObject();
    sessionObj.messages = messages;
    
    res.json({ success: true, session: sessionObj });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/chat/:creatorId/:fanId/messages?before=timestamp
router.get('/:creatorId/:fanId/messages', async (req, res) => {
  try {
    const { creatorId, fanId } = req.params;
    const { before } = req.query;
    
    const Message = require('../models/Message');
    const query = { creatorId, fanId };
    
    if (before) {
      query.sentAt = { $lt: new Date(before) };
    }
    
    const messages = await Message.find(query)
      .sort({ sentAt: -1 })
      .limit(50);
      
    // Sort ascending for frontend display
    messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching paginated messages:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/chat/review
router.post('/review', verifyFanToken, async (req, res) => {
  try {
    const fanId = req.fan.fanId || req.fan.id;
    const { sessionId, creatorId, rating, tags, feedback } = req.body;
    
    if (!creatorId) {
      return res.status(400).json({ success: false, message: 'Missing creatorId' });
    }

    const Creator = require('../models/Creator');
    const Notification = require('../models/Notification');
    const Fan = require('../models/Fan');
    const ChatSession = require('../models/ChatSession');

    const creator = await Creator.findById(creatorId);
    const fan = await Fan.findById(fanId);
    
    if (!creator || !fan) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Save to chat session if sessionId is provided
    if (sessionId) {
      const session = await ChatSession.findById(sessionId);
      if (session) {
        session.review = {
          rating,
          tags: tags || [],
          feedback,
          createdAt: new Date()
        };
        await session.save();
      }
    }

    let reviewText = '';
    if (tags && tags.length > 0) {
      reviewText += tags.join(', ');
    }
    if (feedback) {
      reviewText += (reviewText ? ' - ' : '') + feedback;
    }
    if (!reviewText) {
      reviewText = `${rating} star(s)`;
    } else {
      reviewText = `${rating} star(s): ` + reviewText;
    }

    // Since creators don't use the Notification model for their dash (they fetch dynamically),
    // wait, where are notifications stored for creators?
    // Let's create a CreatorNotification if it exists, otherwise wait! The prompt says "it should be reflected in the notification"
    // In creator.js /notifications we dynamically generate them.
    // If I just save it to ChatSession, I can update creator.js to generate a notification!
    
    res.json({ success: true, message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
