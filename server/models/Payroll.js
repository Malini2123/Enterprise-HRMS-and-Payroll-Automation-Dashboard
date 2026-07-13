const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);