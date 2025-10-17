const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  startDate: Date,
  endDate: Date,
  isFeatured: {
    type: Boolean,
    default: false
  },
  images: [String],
  collaborators: [{
    name: String,
    role: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);