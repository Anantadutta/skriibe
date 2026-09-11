const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const Query = require('../models/Query');
const AdminAlert = require('../models/AdminAlert');

// Configure Cloudinary if credentials are present
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer memory storage for attachments
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
  }
};

const getNextTicketId = async () => {
  try {
    const queries = await Query.find({
      ticketId: { $regex: /^SK-Q-\d+$/ }
    }).select('ticketId').lean();

    let maxNum = 0;
    for (const q of queries) {
      const match = q.ticketId?.match(/^SK-Q-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    let nextNum = maxNum + 1;
    let candidate = `SK-Q-${String(nextNum).padStart(4, '0')}`;

    // Safety check against race condition or collision
    while (await Query.exists({ ticketId: candidate })) {
      nextNum += 1;
      candidate = `SK-Q-${String(nextNum).padStart(4, '0')}`;
    }

    return candidate;
  } catch (err) {
    console.error('Error generating sequential ticket ID:', err);
    return 'SK-Q-0001';
  }
};

/**
 * @route POST /api/queries
 * @desc Submit a new query / support ticket
 */
router.post('/', upload.single('evidence'), async (req, res) => {
  try {
    await connectDB();

    const {
      ticketId,
      queryType,
      creatorName,
      transactionId,
      dateOfIssue,
      amountPaid,
      preferredResolution,
      whatHappened,
      additionalDetails,
      email,
      evidenceUrl: incomingEvidenceUrl
    } = req.body;

    if (!queryType || !whatHappened || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query Type, What happened, and Email are required fields.' 
      });
    }

    const generatedTicketId = await getNextTicketId();

    let finalEvidenceUrl = incomingEvidenceUrl || '';
    let finalEvidenceFileName = '';

    if (req.file) {
      finalEvidenceFileName = req.file.originalname;

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'query_evidence', resource_type: 'auto' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });
          const uploadResult = await uploadPromise;
          finalEvidenceUrl = uploadResult.secure_url;
        } catch (uploadErr) {
          console.error('Cloudinary upload error:', uploadErr);
        }
      }
    }

    const newQuery = await Query.create({
      ticketId: generatedTicketId,
      queryType,
      creatorName: creatorName || '',
      transactionId: transactionId || '',
      dateOfIssue: dateOfIssue || '',
      amountPaid: amountPaid ? String(amountPaid) : '',
      preferredResolution: preferredResolution || '',
      whatHappened,
      evidenceUrl: finalEvidenceUrl,
      evidenceFileName: finalEvidenceFileName,
      additionalDetails: additionalDetails || '',
      email,
      status: 'pending',
      isRead: false
    });

    // Create Admin Alert for the admin dashboard notification
    try {
      await AdminAlert.create({
        type: 'user_query',
        title: `New Query: ${queryType}`,
        message: `Ticket ${newQuery.ticketId} submitted by ${email}`,
        referenceId: newQuery._id,
        isRead: false
      });
    } catch (alertErr) {
      console.error('Error creating AdminAlert for query:', alertErr.message);
    }

    // Emit live socket event if socket.io is attached
    if (req.io) {
      req.io.emit('new-user-query', {
        queryId: newQuery._id,
        ticketId: newQuery.ticketId,
        queryType: newQuery.queryType,
        email: newQuery.email,
        createdAt: newQuery.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      query: newQuery
    });
  } catch (error) {
    console.error('Error creating query:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit query. Please try again later.' 
    });
  }
});

/**
 * @route GET /api/queries/admin/stats
 * @desc Get unread & pending query counts for admin badges
 */
router.get('/admin/stats', async (req, res) => {
  try {
    await connectDB();
    const unreadCount = await Query.countDocuments({ isRead: false });
    const pendingCount = await Query.countDocuments({ status: 'pending' });
    const inReviewCount = await Query.countDocuments({ status: 'in-review' });
    const resolvedCount = await Query.countDocuments({ status: 'resolved' });
    const totalCount = await Query.countDocuments({});

    return res.json({
      success: true,
      unreadCount,
      pendingCount,
      inReviewCount,
      resolvedCount,
      totalCount
    });
  } catch (err) {
    console.error('Error fetching query stats:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/queries/admin
 * @desc Get all queries for admin with filtering & search
 */
router.get('/admin', async (req, res) => {
  try {
    await connectDB();
    const { status, queryType, search } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (queryType && queryType !== 'all') {
      filter.queryType = queryType;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { ticketId: searchRegex },
        { email: searchRegex },
        { creatorName: searchRegex },
        { transactionId: searchRegex },
        { whatHappened: searchRegex }
      ];
    }

    const queries = await Query.find(filter).sort({ createdAt: -1 });

    const unreadCount = await Query.countDocuments({ isRead: false });
    const pendingCount = await Query.countDocuments({ status: 'pending' });
    const inReviewCount = await Query.countDocuments({ status: 'in-review' });
    const resolvedCount = await Query.countDocuments({ status: 'resolved' });
    const totalCount = await Query.countDocuments({});

    return res.json({
      success: true,
      queries,
      stats: {
        totalCount,
        unreadCount,
        pendingCount,
        inReviewCount,
        resolvedCount
      }
    });
  } catch (err) {
    console.error('Error fetching queries:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

const updateQueryHandler = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { status, adminNotes, isRead } = req.body;

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (isRead !== undefined) updateFields.isRead = isRead;

    let updatedQuery = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updatedQuery = await Query.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      );
    }

    if (!updatedQuery) {
      updatedQuery = await Query.findOneAndUpdate(
        { ticketId: id },
        { $set: updateFields },
        { new: true }
      );
    }

    if (!updatedQuery) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    return res.json({
      success: true,
      message: 'Query updated successfully',
      query: updatedQuery
    });
  } catch (err) {
    console.error('Error updating query:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route PATCH /api/queries/admin/:id and /api/queries/:id
 * @desc Update status, notes, or read status of a query
 */
router.patch('/admin/:id', updateQueryHandler);
router.patch('/:id', updateQueryHandler);
router.put('/admin/:id', updateQueryHandler);
router.put('/:id', updateQueryHandler);

/**
 * @route DELETE /api/queries/admin/:id
 * @desc Delete a query
 */
router.delete('/admin/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Query.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Query.findOneAndDelete({ ticketId: id });
    }
    return res.json({ success: true, message: 'Query deleted successfully' });
  } catch (err) {
    console.error('Error deleting query:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
