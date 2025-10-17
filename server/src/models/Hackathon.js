const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  organizer: String,
  position: String,
  projectName: String,
  projectDescription: String,
  technologies: [String],
  teamSize: Number,
  date: Date,
  certificateUrl: String,
  projectUrl: String,
  githubUrl: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
