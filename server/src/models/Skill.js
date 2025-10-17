const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'soft', 'language', 'tool', 'framework'],
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  verifiedBy: [{
    source: String,
    date: Date
  }],
  yearsOfExperience: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);