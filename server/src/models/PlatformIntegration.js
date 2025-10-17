const mongoose = require('mongoose');

const platformIntegrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platformName: {
    type: String,
    required: true,
    enum: ['linkedin', 'github', 'coursera', 'udemy', 'hackerrank', 'leetcode', 'devfolio']
  },
  platformUserId: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastSync: Date,
  syncStatus: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlatformIntegration', platformIntegrationSchema);

module.exports = {
  User: mongoose.model('User', userSchema),
  Resume: mongoose.model('Resume', resumeSchema),
  Internship: mongoose.model('Internship', internshipSchema),
  Course: mongoose.model('Course', courseSchema),
  Hackathon: mongoose.model('Hackathon', hackathonSchema),
  Project: mongoose.model('Project', projectSchema),
  Skill: mongoose.model('Skill', skillSchema),
  PlatformIntegration: mongoose.model('PlatformIntegration', platformIntegrationSchema)
};