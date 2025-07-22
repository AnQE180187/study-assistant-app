const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
      },
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        role: true,
        language: true,
        theme: true,
        createdAt: true,
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Forgot password - send reset token
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    // Gửi email (ở đây mock bằng log ra console)
    console.log(`Reset password link: http://localhost:3000/reset-password?token=${resetToken}&email=${email}`);

    res.json({ message: 'Reset password link sent to email (mocked)' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    if (user.resetPasswordToken !== token || new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Gửi OTP quên mật khẩu
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await prisma.otp.create({ data: { email, otp, expiresAt } });

  // Gửi email bằng nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Mã OTP đặt lại mật khẩu',
    text: `Mã OTP của bạn là: ${otp}`,
  });

  res.json({ message: 'Đã gửi OTP về email' });
};

// Xác thực OTP quên mật khẩu
exports.verifyOtpForgot = async (req, res) => {
  const { email, otp } = req.body;
  const record = await prisma.otp.findFirst({ where: { email, otp } });
  if (!record) return res.status(400).json({ message: 'OTP không đúng' });
  if (new Date() > record.expiresAt) return res.status(400).json({ message: 'OTP đã hết hạn' });
  res.json({ message: 'OTP hợp lệ' });
};

// Đặt lại mật khẩu mới
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const record = await prisma.otp.findFirst({ where: { email, otp } });
  if (!record) return res.status(400).json({ message: 'OTP không đúng' });
  if (new Date() > record.expiresAt) return res.status(400).json({ message: 'OTP đã hết hạn' });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hash } });
  await prisma.otp.deleteMany({ where: { email } });

  res.json({ message: 'Đặt lại mật khẩu thành công' });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, gender } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        role: true,
        language: true,
        theme: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update language preference
// @route   PUT /api/users/language
// @access  Private
const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user.id;

    if (!['vi', 'en'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language. Use "vi" or "en"' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { language },
      select: {
        id: true,
        language: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update theme preference
// @route   PUT /api/users/theme
// @access  Private
const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const userId = req.user.id;

    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme. Use "light" or "dark"' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { theme },
      select: {
        id: true,
        theme: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    // Chỉ cho phép admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  changePassword,
  updateLanguage,
  updateTheme,
  forgotPassword: exports.forgotPassword, // ensure OTP version is exported
  resetPassword: exports.resetPassword,   // ensure OTP version is exported
  verifyOtpForgot: exports.verifyOtpForgot, // add this line
  getAllUsers,
}; 