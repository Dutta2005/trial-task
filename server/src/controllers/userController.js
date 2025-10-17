const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Send token response with user data
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const userResponse = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    profilePicture: user.profilePicture,
    bio: user.bio,
    location: user.location,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    portfolioUrl: user.portfolioUrl,
    credibilityScore: user.credibilityScore,
    createdAt: user.createdAt
  };

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, fullName, phone, role } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  const user = await User.create({
    email: email.toLowerCase(),
    password,
    fullName,
    phone,
    role: role || 'student'
  });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  
  user.verificationToken = hashedToken;
  user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  // TODO: Send verification email
  // await sendVerificationEmail(user.email, verificationToken);

  console.log(`✅ New user registered: ${user.email}`);
  
  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  await user.updateLastLogin();

  console.log(`✅ User logged in: ${user.email}`);

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = {
    fullName: req.body.fullName,
    phone: req.body.phone,
    bio: req.body.bio,
    location: req.body.location,
    linkedinUrl: req.body.linkedinUrl,
    githubUrl: req.body.githubUrl,
    portfolioUrl: req.body.portfolioUrl,
    profilePicture: req.body.profilePicture
  };

  Object.keys(allowedFields).forEach(key => 
    allowedFields[key] === undefined && delete allowedFields[key]
  );

  if (Object.keys(allowedFields).length === 0) {
    return next(new AppError('No fields provided for update', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    allowedFields,
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  console.log(`✅ Profile updated: ${user.email}`);

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from current password', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  console.log(`✅ Password changed: ${user.email}`);

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Forgot password - Send reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to database
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  // TODO: Send email with reset link
  // For now, log to console (in production, send via email service)
  console.log('Password Reset URL:', resetUrl);
  console.log('Reset Token:', resetToken);

  try {
    // In production, implement email sending here
    // await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === 'development' && { 
        resetToken,
        resetUrl 
      })
    });
  } catch (err) {
    console.error('Error sending reset email:', err);
   
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending password reset email. Please try again later', 500));
  }
});

/**
 * @desc    Reset password using token
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide a new password', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  const isSamePassword = await user.comparePassword(password);
  if (isSamePassword) {
    return next(new AppError('New password must be different from the old password', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  console.log(`✅ Password reset successful: ${user.email}`);

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Verify email address
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError('Verification token is required', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid verification token
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  console.log(`✅ Email verified: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now access all features.'
  });
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
exports.resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  
  user.verificationToken = hashedToken;
  user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

  // TODO: Send verification email
  console.log('Verification URL:', verificationUrl);

  res.status(200).json({
    success: true,
    message: 'Verification email sent',
    ...(process.env.NODE_ENV === 'development' && { 
      verificationUrl 
    })
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });

  console.log(`✅ User logged out: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide your password to confirm account deletion', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError('Incorrect password', 401));
  }

  // TODO: Delete all related data (resumes, internships, projects, etc.)
  // This should be done in a transaction or using cascade delete
  const Resume = require('../models/Resume');
  const Internship = require('../models/Internship');
  const Project = require('../models/Project');
  const Course = require('../models/Course');
  const Hackathon = require('../models/Hackathon');

  await Promise.all([
    Resume.deleteMany({ userId: user._id }),
    Internship.deleteMany({ userId: user._id }),
    Project.deleteMany({ userId: user._id }),
    Course.deleteMany({ userId: user._id }),
    Hackathon.deleteMany({ userId: user._id })
  ]);

  // Delete user account
  await User.findByIdAndDelete(user._id);

  console.log(`❌ Account deleted: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Account and all associated data deleted successfully'
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/auth/stats
 * @access  Private
 */
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const Resume = require('../models/Resume');
  const Internship = require('../models/Internship');
  const Project = require('../models/Project');
  const Course = require('../models/Course');
  const Hackathon = require('../models/Hackathon');

  const [resumeCount, internshipCount, projectCount, courseCount, hackathonCount, verifiedInternships, verifiedCourses] = await Promise.all([
    Resume.countDocuments({ userId: req.user._id }),
    Internship.countDocuments({ userId: req.user._id }),
    Project.countDocuments({ userId: req.user._id }),
    Course.countDocuments({ userId: req.user._id }),
    Hackathon.countDocuments({ userId: req.user._id }),
    Internship.countDocuments({ userId: req.user._id, verificationStatus: 'verified' }),
    Course.countDocuments({ userId: req.user._id, verificationStatus: 'verified' })
  ]);

  const totalVerifiable = internshipCount + courseCount + hackathonCount;
  const totalVerified = verifiedInternships + verifiedCourses;
  const verificationPercentage = totalVerifiable > 0 
    ? Math.round((totalVerified / totalVerifiable) * 100) 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      resumes: resumeCount,
      internships: internshipCount,
      projects: projectCount,
      courses: courseCount,
      hackathons: hackathonCount,
      verifiedInternships,
      verifiedCourses,
      verificationPercentage,
      credibilityScore: req.user.credibilityScore,
      accountAge: Math.floor((Date.now() - new Date(req.user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) // days
    }
  });
});

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/auth/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!['student', 'professional', 'admin'].includes(role)) {
    return next(new AppError('Invalid role. Must be student, professional, or admin', 400));
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  console.log(`✅ User role updated: ${user.email} -> ${role}`);

  res.status(200).json({
    success: true,
    data: user,
    message: 'User role updated successfully'
  });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users
  });
});