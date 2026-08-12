const mongoose = require('mongoose');

const jobOpeningSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'San Francisco, CA (Hybrid)',
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time',
  },
  experience: {
    type: String,
    default: '3-5 years',
  },
  salaryRange: {
    type: String,
    default: '$90,000 - $130,000',
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'paused'],
    default: 'open',
  },
  openingsCount: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

const candidateSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOpening',
  },
  jobTitle: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  stage: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
    default: 'applied',
  },
  rating: {
    type: Number,
    default: 4,
  },
  resumeUrl: {
    type: String,
  },
  notes: {
    type: String,
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const JobOpening = mongoose.model('JobOpening', jobOpeningSchema);
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = { JobOpening, Candidate };
