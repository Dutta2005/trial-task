const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: String,
    default: 'modern'
  },
  visibility: {
    type: String,
    enum: ['private', 'public', 'shared'],
    default: 'private'
  },
  summary: String,
  sections: {
    education: { type: Boolean, default: true },
    internships: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    courses: { type: Boolean, default: true },
    hackathons: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true }
  },
  customSections: [{
    title: String,
    content: String,
    order: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);