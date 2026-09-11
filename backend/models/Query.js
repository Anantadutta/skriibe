const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema(
  {
    ticketId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    queryType: { 
      type: String, 
      required: true 
    },
    creatorName: { 
      type: String, 
      default: '' 
    },
    transactionId: { 
      type: String, 
      default: '' 
    },
    dateOfIssue: { 
      type: String, 
      default: '' 
    },
    amountPaid: { 
      type: String, 
      default: '' 
    },
    preferredResolution: { 
      type: String, 
      default: '' 
    },
    whatHappened: { 
      type: String, 
      required: true 
    },
    evidenceUrl: { 
      type: String, 
      default: '' 
    },
    evidenceFileName: { 
      type: String, 
      default: '' 
    },
    additionalDetails: { 
      type: String, 
      default: '' 
    },
    email: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'in-review', 'resolved', 'rejected'], 
      default: 'pending',
      index: true 
    },
    isRead: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    adminNotes: { 
      type: String, 
      default: '' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Query || mongoose.model('Query', QuerySchema);
