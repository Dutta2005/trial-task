const internshipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  description: String,
  responsibilities: [String],
  achievements: [String],
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isCurrentlyWorking: {
    type: Boolean,
    default: false
  },
  location: String,
  certificateUrl: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  platformId: String,
  platformName: String,
  skills: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);