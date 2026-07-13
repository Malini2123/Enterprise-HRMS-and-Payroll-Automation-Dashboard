const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'earned', 'unpaid'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);