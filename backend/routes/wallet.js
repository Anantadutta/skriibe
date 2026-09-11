const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Fan = require('../models/Fan');
const WalletTransaction = require('../models/WalletTransaction');
const { verifyFanToken } = require('../middleware/auth');
const Razorpay = require('razorpay');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// GET /api/wallet/balance
router.get('/balance', verifyFanToken, async (req, res) => {
  try {
    const fan = await Fan.findById(req.fan.fanId);
    if (!fan) return res.status(404).json({ success: false, message: 'Fan not found' });
    res.json({ 
      success: true, 
      balance: fan.walletBalance || 0,
      hasUsedFreeChat: !!fan.hasUsedFreeChat
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/wallet/topup
router.post('/topup', verifyFanToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_topup_${req.fan.fanId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating topup order:', error);
    res.status(500).json({ success: false, message: 'Error creating order' });
  }
});

// POST /api/wallet/verify-topup
router.post('/verify-topup', verifyFanToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Process top-up
    const fan = await Fan.findById(req.fan.fanId);
    if (!fan) return res.status(404).json({ success: false, message: 'Fan not found' });

    // Ensure we don't double-process the same payment
    const existingTx = await WalletTransaction.findOne({ reference: razorpay_payment_id, type: 'credit' });
    if (existingTx) {
      return res.json({ success: true, balance: fan.walletBalance });
    }

    // Add transaction
    const tx = new WalletTransaction({
      fanId: fan._id,
      amount: amount,
      type: 'credit',
      reference: razorpay_payment_id,
      status: 'completed',
      description: 'Wallet Top-up'
    });
    await tx.save();

    // Update balance
    fan.walletBalance = (fan.walletBalance || 0) + amount;
    await fan.save();

    res.json({ success: true, balance: fan.walletBalance });
  } catch (error) {
    console.error('Error verifying topup:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', verifyFanToken, async (req, res) => {
  try {
    const Fan = require('../models/Fan');
    const Creator = require('../models/Creator');
    const Question = require('../models/Question');

    let fanId = req.fan.fanId;
    let fanUser = fanId ? await Fan.findById(fanId) : null;
    
    if (!fanUser && req.fan.email) {
      fanUser = await Fan.findOne({ email: req.fan.email.toLowerCase() });
      if (fanUser) fanId = fanUser._id;
    }

    if (!fanUser && req.fan.creatorId) {
      const creator = await Creator.findById(req.fan.creatorId);
      if (creator?.fanId) {
        fanUser = await Fan.findById(creator.fanId);
        if (fanUser) fanId = fanUser._id;
      } else if (creator?.email) {
        fanUser = await Fan.findOne({ email: creator.email.toLowerCase() });
        if (fanUser) fanId = fanUser._id;
      }
    }

    const allFanIds = [fanId, fanUser?._id, req.fan.fanId].filter(Boolean);
    const transactions = await WalletTransaction.find({ fanId: { $in: allFanIds } })
      .populate('creatorId', 'name avatarUrl handle')
      .sort({ createdAt: -1 });

    const existingTxRefs = new Set(
      transactions.map(t => t.reference?.toString()).filter(Boolean)
    );

    // Build flexible conditions to find ANY questions asked by this fan
    const fanEmail = req.fan.email || fanUser?.email;
    const fanConditions = [];
    if (allFanIds.length > 0) {
      fanConditions.push({ fanId: { $in: allFanIds } });
    }
    if (fanEmail) {
      fanConditions.push({ buyerEmail: fanEmail });
      fanConditions.push({ buyerEmail: fanEmail.toLowerCase() });
      fanConditions.push({ buyerEmail: { $regex: new RegExp(`^${fanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } });
    }
    if (fanUser?.phone || fanUser?.whatsappPhone) {
      const p = fanUser.phone || fanUser.whatsappPhone;
      fanConditions.push({ buyerPhone: p });
      if (p.startsWith('+91')) {
        fanConditions.push({ buyerPhone: p.replace(/^\+91/, '') });
      } else {
        fanConditions.push({ buyerPhone: `+91${p}` });
      }
    }

    let paidQuestions = [];
    if (fanConditions.length > 0) {
      paidQuestions = await Question.find({
        $or: fanConditions,
        isFollowUp: { $ne: true }
      }).populate('creatorId', 'name avatarUrl handle price pricePerQuestion');
    }

    const missingTxs = [];
    for (const q of paidQuestions) {
      const refStr = q._id.toString();
      if (!existingTxRefs.has(refStr)) {
        try {
          const creatorObj = q.creatorId;
          const creatorName = creatorObj?.name || creatorObj?.handle || q.handle || 'Creator';
          const qAmount = (q.amountPaid && q.amountPaid > 0)
            ? q.amountPaid
            : (creatorObj?.pricePerQuestion || creatorObj?.price || 10);

          const newTx = new WalletTransaction({
            fanId: fanId || allFanIds[0],
            creatorId: creatorObj?._id || creatorObj,
            amount: qAmount,
            type: 'debit',
            reference: refStr,
            status: 'completed',
            description: `AMA • ${creatorName}`,
            createdAt: q.createdAt || new Date()
          });
          await newTx.save();
          if (creatorObj && typeof creatorObj === 'object') {
            newTx.creatorId = creatorObj;
          }
          missingTxs.push(newTx);
          existingTxRefs.add(refStr);

          // Backfill fanId and amountPaid on the question document if missing
          if (!q.fanId && (fanId || allFanIds[0])) {
            q.fanId = fanId || allFanIds[0];
          }
          if (!q.amountPaid) {
            q.amountPaid = qAmount;
          }
          await q.save();
        } catch (e) {
          console.error('Failed to backfill question tx', e);
        }
      }
    }

    const allTransactions = [...transactions, ...missingTxs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, transactions: allTransactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/wallet/tip
router.post('/tip', verifyFanToken, async (req, res) => {
  try {
    const { creatorId, amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid tip amount' });
    }

    const fan = await Fan.findById(req.fan.fanId);
    if (!fan) return res.status(404).json({ success: false, message: 'Fan not found' });
    
    const currentBalance = fan.walletBalance || 0;
    if (currentBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    fan.walletBalance = currentBalance - amount;
    await fan.save();

    const tx = new WalletTransaction({
      fanId: fan._id,
      creatorId: creatorId,
      amount: amount,
      type: 'debit',
      status: 'completed',
      description: 'Tip sent'
    });
    await tx.save();

    // Optionally update creator's payout logic here
    if (req.io) {
      req.io.to(`creator_${creatorId}`).emit('tip-received', { amount, fanName: fan.name });
      req.io.emit('tip-received', { creatorId, amount });
    }
    
    res.json({ success: true, balance: fan.walletBalance, transaction: tx });
  } catch (error) {
    console.error('Error sending tip:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
