const Internship = require('../models/Internship.js');

// @desc    Get all internships for user
// @route   GET /api/internships
// @access  Private
exports.getInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ userId: req.user.id })
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new internship
// @route   POST /api/internships
// @access  Private
exports.addInternship = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const internship = await Internship.create(req.body);

    await Resume.updateOne(
      { userId: req.user.id, isDefault: true },
      { lastUpdated: Date.now() }
    );

    await updateCredibilityScore(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Internship added successfully',
      data: internship
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private
exports.updateInternship = async (req, res, next) => {
  try {
    let internship = await Internship.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await Resume.updateOne(
      { userId: req.user.id, isDefault: true },
      { lastUpdated: Date.now() }
    );

    res.status(200).json({
      success: true,
      message: 'Internship updated successfully',
      data: internship
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private
exports.deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    await internship.deleteOne();

    await updateCredibilityScore(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Internship deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update credibility score
async function updateCredibilityScore(userId) {
  const [internships, courses, hackathons, projects] = await Promise.all([
    Internship.countDocuments({ userId, verificationStatus: 'verified' }),
    Course.countDocuments({ userId, verificationStatus: 'verified' }),
    Hackathon.countDocuments({ userId, verificationStatus: 'verified' }),
    Project.countDocuments({ userId })
  ]);

  // Simple credibility calculation
  const score = Math.min(100, (internships * 15) + (courses * 10) + (hackathons * 12) + (projects * 8));

  await User.findByIdAndUpdate(userId, { credibilityScore: score });
}