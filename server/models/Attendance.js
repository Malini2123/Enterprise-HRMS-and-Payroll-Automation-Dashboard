const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  punchIn: {
    type: Date,
  },
  punchOut: {
    type: Date,
  },
  breaks: [
    {
      start: { type: Date },
      end: { type: Date },
      durationMinutes: { type: Number, default: 0 },
    },
  ],
  totalWorkHours: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'late', 'on_leave', 'holiday'],
    default: 'present',
  },
  workMode: {
    type: String,
    enum: ['office', 'remote', 'hybrid'],
    default: 'office',
  },
  regularized: {
    type: Boolean,
    default: false,
  },
  regularizationReason: {
    type: String,
  },
  regularizationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
