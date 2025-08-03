const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  changePassword,
  updateLanguage,
  updateTheme,
  forgotPassword,
  resetPassword,
  verifyOtpForgot,
  getAllUsers,
  getAdminStats,
  deleteUser,
  updateUserRole,
  googleLogin,
} = require("../controllers/userController");
const {
  sendOtp,
  verifyOtpAndRegister,
} = require("../controllers/authController");
const { protect, admin } = require("../middlewares/authMiddleware");
const emailService = require("../services/emailService");

// Public routes
router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp-forgot", verifyOtpForgot);
router.post("/reset-password", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/language", protect, updateLanguage);
router.put("/theme", protect, updateTheme);

// Admin routes
router.get("/", protect, admin, getAllUsers);
router.get("/admin/stats", protect, admin, getAdminStats);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id/role", protect, admin, updateUserRole);

// Test email service (development only)
router.post("/test-email", async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res
        .status(403)
        .json({ message: "Only available in development mode" });
    }

    const { email, type = "registration" } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let result;
    switch (type) {
      case "registration":
        result = await emailService.sendRegistrationOTP(email, "123456", 5);
        break;
      case "password-reset":
        result = await emailService.sendPasswordResetOTP(email, "654321", 5);
        break;
      case "welcome":
        result = await emailService.sendWelcomeEmail(email, "Test User");
        break;
      case "test-connection":
        result = await emailService.testConnection();
        break;
      default:
        return res.status(400).json({ message: "Invalid email type" });
    }

    res.json({
      message: "Email sent successfully",
      result,
      type,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
});

module.exports = router;
