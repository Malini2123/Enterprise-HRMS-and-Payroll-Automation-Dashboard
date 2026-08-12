const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['IT Support', 'Payroll & Tax', 'HR Inquiry', 'Facilities & Admin', 'Leave & Attendance'],
    default: 'IT Support',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  description: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: String,
    default: 'Unassigned',
  },
  replies: [
    {
      author: { type: String, required: true },
      authorRole: { type: String, default: 'employee' },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
