// src/routes/auth.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  deleteAccount
} = require('../controllers/userController');

const { protect } = require('../middlewares/auth.js');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.delete('/account', protect, deleteAccount);

module.exports = router;