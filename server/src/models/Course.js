const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  instructor: String,
  completionDate: Date,
  certificateId: String,
  certificateUrl: String,
  skillsLearned: [String],
  duration: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  grade: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);