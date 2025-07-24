const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
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
      return res.status(400).json({ message: "User already exists" });
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
        role: role || "student",
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
      res.status(401).json({ message: "Invalid email or password" });
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
        education: true,
        role: true,
        language: true,
        theme: true,
        createdAt: true,
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
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
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    // Gửi email (ở đây mock bằng log ra console)
    console.log(
      `Reset password link: http://localhost:3000/reset-password?token=${resetToken}&email=${email}`
    );

    res.json({ message: "Reset password link sent to email (mocked)" });
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
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    if (
      user.resetPasswordToken !== token ||
      new Date(user.resetPasswordExpires) < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
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
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Gửi OTP quên mật khẩu
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "Email không tồn tại" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await prisma.otp.create({ data: { email, otp, expiresAt } });

  // Gửi email bằng nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Mã OTP đặt lại mật khẩu",
    text: `Mã OTP của bạn là: ${otp}`,
  });

  res.json({ message: "Đã gửi OTP về email" });
};

// Xác thực OTP quên mật khẩu
exports.verifyOtpForgot = async (req, res) => {
  const { email, otp } = req.body;
  const record = await prisma.otp.findFirst({ where: { email, otp } });
  if (!record) return res.status(400).json({ message: "OTP không đúng" });
  if (new Date() > record.expiresAt)
    return res.status(400).json({ message: "OTP đã hết hạn" });
  res.json({ message: "OTP hợp lệ" });
};

// Đặt lại mật khẩu mới
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const record = await prisma.otp.findFirst({ where: { email, otp } });
  if (!record) return res.status(400).json({ message: "OTP không đúng" });
  if (new Date() > record.expiresAt)
    return res.status(400).json({ message: "OTP đã hết hạn" });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hash } });
  await prisma.otp.deleteMany({ where: { email } });

  res.json({ message: "Đặt lại mật khẩu thành công" });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, gender, education, avatar } = req.body;
    const userId = req.user.id;

    // Validate education level if provided
    if (
      education &&
      ![
        "ELEMENTARY",
        "MIDDLE_SCHOOL",
        "HIGH_SCHOOL",
        "UNIVERSITY",
        "GRADUATE",
        "OTHER",
      ].includes(education)
    ) {
      return res.status(400).json({ message: "Invalid education level" });
    }

    // Validate gender if provided
    console.log(
      "🔍 Gender validation - received:",
      gender,
      "type:",
      typeof gender
    );
    if (
      gender &&
      gender.trim() &&
      !["male", "female", "other"].includes(gender.toLowerCase().trim())
    ) {
      console.log("❌ Invalid gender value:", gender);
      return res.status(400).json({ message: "Invalid gender value" });
    }

    // Prepare update data - only include fields that are provided
    const updateData = {};

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }

    if (dateOfBirth !== undefined) {
      if (dateOfBirth === null || dateOfBirth === "") {
        updateData.dateOfBirth = null;
      } else {
        try {
          updateData.dateOfBirth = new Date(dateOfBirth);
        } catch (error) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
    }

    if (gender !== undefined) {
      updateData.gender = gender || null;
    }

    if (education !== undefined) {
      updateData.education = education || null;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
      console.log("🖼️ Avatar update:", avatar, "->", updateData.avatar);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        education: true,
        role: true,
        language: true,
        theme: true,
        createdAt: true,
      },
    });

    console.log(
      `✅ Profile updated for user ${updatedUser.email}:`,
      Object.keys(updateData)
    );
    res.json(updatedUser);
  } catch (error) {
    console.error("❌ Profile update error:", error);
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
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
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

    if (!["vi", "en"].includes(language)) {
      return res
        .status(400)
        .json({ message: 'Invalid language. Use "vi" or "en"' });
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

    if (!["light", "dark"].includes(theme)) {
      return res
        .status(400)
        .json({ message: 'Invalid theme. Use "light" or "dark"' });
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
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    // First, clean up invalid education values
    await prisma.user.updateMany({
      where: {
        education: {
          notIn: [
            "ELEMENTARY",
            "MIDDLE_SCHOOL",
            "HIGH_SCHOOL",
            "UNIVERSITY",
            "GRADUATE",
          ],
        },
      },
      data: {
        education: null,
      },
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        education: true,
        gender: true,
        dateOfBirth: true,
        language: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            notes: true,
            decks: true,
            studyPlans: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin statistics
// @route   GET /api/users/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    // Get users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get total notes count
    const totalNotes = await prisma.note.count();

    // Get total flashcard decks count
    const totalDecks = await prisma.deck.count();

    // Get total flashcards count
    const totalFlashcards = await prisma.flashcard.count();

    // Get total study plans count
    const totalStudyPlans = await prisma.studyPlan.count();

    // Format role statistics
    const roleStats = {};
    usersByRole.forEach((item) => {
      roleStats[item.role.toLowerCase()] = item._count.role;
    });

    const stats = {
      users: {
        total: totalUsers,
        newLast30Days: newUsersLast30Days,
        byRole: roleStats,
      },
      content: {
        notes: totalNotes,
        decks: totalDecks,
        flashcards: totalFlashcards,
        studyPlans: totalStudyPlans,
      },
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    // Delete user and related data
    await prisma.$transaction(async (tx) => {
      // Delete user's notes
      await tx.note.deleteMany({ where: { userId: id } });

      // Delete user's flashcards and decks
      await tx.flashcard.deleteMany({
        where: {
          deck: { userId: id },
        },
      });
      await tx.deck.deleteMany({ where: { userId: id } });

      // Delete user's study plans
      await tx.studyPlan.deleteMany({ where: { userId: id } });

      // Delete user's AI logs
      await tx.aiLog.deleteMany({ where: { userId: id } });

      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Promote/demote user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!["USER", "ADMIN"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be USER or ADMIN" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User role updated to ${role} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
  resetPassword: exports.resetPassword, // ensure OTP version is exported
  verifyOtpForgot: exports.verifyOtpForgot, // add this line
  getAllUsers,
  getAdminStats,
  deleteUser,
  updateUserRole,
};
