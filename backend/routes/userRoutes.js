const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateProfile, changePassword, updateLanguage, updateTheme, forgotPassword, resetPassword, verifyOtpForgot, getAllUsers } = require('../controllers/userController');
const { sendOtp, verifyOtpAndRegister } = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp-forgot', verifyOtpForgot);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndRegister);

// Protected routes
router.get('/', protect, admin, getAllUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/language', protect, updateLanguage);
router.put('/theme', protect, updateTheme);

module.exports = router; 