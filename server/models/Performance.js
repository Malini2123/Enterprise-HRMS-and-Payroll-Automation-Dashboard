const mongoose = require('mongoose');

const okrSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quarter: {
    type: String, // e.g. "Q3 2026"
    required: true,
  },
  objective: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Engineering', 'Product', 'Culture', 'Leadership', 'Sales', 'Operational'],
    default: 'Engineering',
  },
  keyResults: [
    {
      title: { type: String, required: true },
      currentValue: { type: Number, default: 0 },
      targetValue: { type: Number, default: 100 },
      unit: { type: String, default: '%' },
    },
  ],
  progress: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['on_track', 'behind', 'at_risk', 'completed'],
    default: 'on_track',
  },
}, { timestamps: true });

const kudosSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badge: {
    type: String,
    enum: ['Team Player', 'Problem Solver', 'Rockstar', 'Leadership', 'Innovator', 'Customer Champion'],
    default: 'Team Player',
  },
  message: {
    type: String,
    required: true,
  },
  claps: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

const OKR = mongoose.model('OKR', okrSchema);
const Kudos = mongoose.model('Kudos', kudosSchema);

module.exports = { OKR, Kudos };
