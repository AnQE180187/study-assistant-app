const prisma = require('../config/prismaClient');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const OTP_EXPIRE_MINUTES = parseInt(process.env.OTP_EXPIRE_MINUTES || '5', 10);

// Gửi OTP qua email
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

    // Sinh OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    // Xóa OTP cũ nếu có
    await prisma.otp.deleteMany({ where: { email } });
    // Lưu OTP mới
    await prisma.otp.create({ data: { email, otp, expiresAt } });

    // Gửi email
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
      subject: 'Mã xác thực đăng ký tài khoản',
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong ${OTP_EXPIRE_MINUTES} phút.</p>`
    });

    res.json({ message: 'Đã gửi mã OTP tới email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xác thực OTP và tạo tài khoản
exports.verifyOtpAndRegister = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) return res.status(400).json({ message: 'Thiếu thông tin' });

    // Tìm OTP
    const otpRecord = await prisma.otp.findFirst({ where: { email, otp } });
    if (!otpRecord) return res.status(400).json({ message: 'OTP không đúng' });
    if (new Date(otpRecord.expiresAt) < new Date()) {
      await prisma.otp.delete({ where: { id: otpRecord.id } });
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }

    // Kiểm tra user đã tồn tại chưa
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'Email đã được đăng ký' });

    // Tạo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        isVerified: true,
        role: 'student',
      },
    });
    // Xóa OTP
    await prisma.otp.delete({ where: { id: otpRecord.id } });
    res.json({ message: 'Đăng ký thành công. Bạn có thể đăng nhập.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 