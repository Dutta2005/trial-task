const Course = require('../models/Course.js');

// @desc    Get all courses for user
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ userId: req.user.id })
      .sort({ completionDate: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new course
// @route   POST /api/courses
// @access  Private
exports.addCourse = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const course = await Course.create(req.body);

    // Update resume and credibility
    await Resume.updateOne(
      { userId: req.user.id, isDefault: true },
      { lastUpdated: Date.now() }
    );
    await updateCredibilityScore(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Course added successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await Resume.updateOne(
      { userId: req.user.id, isDefault: true },
      { lastUpdated: Date.now() }
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await course.deleteOne();
    await updateCredibilityScore(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};