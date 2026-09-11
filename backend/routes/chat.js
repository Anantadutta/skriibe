const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const Fan = require('../models/Fan');
const Creator = require('../models/Creator');
const WalletTransaction = require('../models/WalletTransaction');
const Counter = require('../models/Counter');
const { verifyFanToken, verifyCreatorToken } = require('../middleware/auth');

// POST /api/chat/start
router.post('/start', verifyFanToken, async (req, res) => {
  try {
    const { creatorId } = req.body;
    
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

    if (!fan.hasUsedFreeChat) {
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

    // Check if there is an active session
    let session = await ChatSession.findOne({ creatorId: creator._id, fanId: fan._id, status: 'active' });
    let isNew = false;
    if (!session) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'chatId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const newChatId = String(counter.seq).padStart(13, '0');

      session = new ChatSession({
        creatorId: creator._id,
        fanId: fan._id,
        ratePerMinute: rate,
        isFreeChat: isFreeChat,
        status: 'active',
        chatId: newChatId
      });
      await session.save();
      isNew = true;
    } else {
      // Refresh the start time and the current rate so the creator sees it as a fresh request with the newest price!
      let newChatId = session.chatId;
      if (!newChatId || !newChatId.startsWith('0')) {
        const counter = await Counter.findOneAndUpdate(
          { _id: 'chatId' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        newChatId = String(counter.seq).padStart(13, '0');
      }

      await ChatSession.updateOne(
        { _id: session._id },
        { $set: { startTime: new Date(), ratePerMinute: rate, isFreeChat: isFreeChat, chatId: newChatId } }
      );
      session.startTime = new Date();
      session.ratePerMinute = rate;
      session.isFreeChat = isFreeChat;
      session.chatId = newChatId;
    }

    // Fetch first page of messages (last 50)
    const Message = require('../models/Message');
    const messages = await Message.find({ sessionId: session._id })
      .sort({ sentAt: -1 })
      .limit(50);
    
    // Sort ascending for frontend display
    messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

    // Notify creator via socket
    if (req.io) {
      req.io.to(`creator_${creator._id.toString()}`).emit('incoming_chat_request', {
        sessionId: session._id,
        fanName: fan.name || 'A Fan',
        rate,
        time: new Date().toISOString(), // Always use current time so it pops up fresh
        walletBalance: fan.walletBalance || 0
      });
    }

    res.json({ success: true, sessionId: session._id, chatId: session.chatId, rate, isFreeChat, messages, time: new Date().toISOString() });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/chat/end
router.post('/end', async (req, res) => {
  try {
    const { sessionId, cancelBeforeStart, reason } = req.body;
    const session = await ChatSession.findById(sessionId);
    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session already ended' });
    }
    
    const fan = await Fan.findById(session.fanId);
    if (fan && session.startTime && !cancelBeforeStart) {
      const rate = session.ratePerMinute;
      const elapsedSeconds = (Date.now() - session.startTime.getTime()) / 1000;
      const expectedTotalCost = (elapsedSeconds / 60) * rate;
      let amountToDeduct = expectedTotalCost - (session.totalCost || 0);
      
      if (session.isFreeChat) {
        fan.hasUsedFreeChat = true;
        // Don't await save here yet, it'll be saved below or we can just save it now.
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
      totalMinutes: session.totalMinutes,
      totalCost: session.totalCost
    };

    if (cancelBeforeStart && reason === 'USER_CANCEL') {
      updateFields.cancelledByFan = true;
    }

    await ChatSession.updateOne({ _id: session._id }, { $set: updateFields });
    session.status = 'ended'; // keep local object updated for below logic

    if (req.io) {
      req.io.to(sessionId.toString()).emit('chat_ended', { 
        totalMinutes: session.totalMinutes,
        totalCost: session.totalCost,
        reason: reason || 'USER_ENDED'
      });
      // Notify creator dashboard immediately if it was cancelled/missed
      req.io.to(`creator_${session.creatorId.toString()}`).emit('chat_cancelled_by_fan', {
        sessionId: session._id,
        fanId: session.fanId,
        startTime: session.startTime
      });
      req.io.to(`creator_${session.creatorId.toString()}`).emit('chat_ended', {
        sessionId: session._id
      });
      req.io.emit('chat-session-ended', {
        creatorId: session.creatorId.toString(),
        sessionId: session._id
      });
    }

    res.json({ success: true, totalMinutes: session.totalMinutes, totalCost: session.totalCost });
  } catch (error) {
    console.error('Error ending chat:', error);
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
      status: 'ended',
      cancelledByFan: { $ne: true }
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
      status: 'active'
    }).populate('fanId', 'name avatarUrl walletBalance');

    const pendingChats = [];
    const now = Date.now();
    
    for (const session of activeSessions) {
      const chatTime = session.startTime || session.createdAt || session.updatedAt;
      if (chatTime && (now - new Date(chatTime).getTime() > 125000)) {
         session.status = 'ended';
         session.totalMinutes = 0;
         session.totalCost = 0;
         session.endTime = new Date();
         session.cancelledByFan = false;
         await session.save();
         continue; 
      }
      pendingChats.push({
        sessionId: session._id,
        fanName: session.fanId?.name || 'A Fan',
        rate: session.ratePerMinute,
        time: chatTime || new Date().toISOString(),
        walletBalance: session.fanId?.walletBalance || 0
      });
    }

    res.json({ success: true, pendingChats });
  } catch (error) {
    console.error('Error fetching pending chats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/chat/:sessionId
router.get('/:sessionId', verifyFanToken, async (req, res) => {
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
