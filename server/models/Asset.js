const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetTag: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Laptop', 'Monitor', 'Phone', 'Accessories', 'Security Key', 'Software License'],
    default: 'Laptop',
  },
  model: {
    type: String,
    required: true,
  },
  serialNumber: {
    type: String,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['allocated', 'available', 'under_repair', 'retired'],
    default: 'available',
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Needs Service'],
    default: 'Excellent',
  },
  warrantyExpiry: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
