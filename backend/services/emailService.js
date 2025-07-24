const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
        pool: true, // Use connection pooling
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || "14", 10), // Max emails per second
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error("❌ Email service configuration error:", error);
        } else {
          console.log("✅ Email service is ready to send messages");
        }
      });
    } catch (error) {
      console.error("❌ Failed to initialize email transporter:", error);
    }
  }

  // Load email template
  loadTemplate(templateName) {
    try {
      const templatePath = path.join(
        __dirname,
        "../templates/email",
        `${templateName}.html`
      );
      return fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      console.error(`❌ Failed to load email template ${templateName}:`, error);
      return null;
    }
  }

  // Replace placeholders in template
  replacePlaceholders(template, data) {
    let result = template;
    Object.keys(data).forEach((key) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, "g"), data[key]);
    });
    return result;
  }

  // Send OTP for registration
  async sendRegistrationOTP(email, otp, expiryMinutes = 5) {
    try {
      const template = this.loadTemplate("registration-otp");
      if (!template) {
        throw new Error("Registration OTP template not found");
      }

      const htmlContent = this.replacePlaceholders(template, {
        otp: otp,
        expiryMinutes: expiryMinutes,
        email: email,
        currentYear: new Date().getFullYear(),
        appName: "Smart Study Assistant",
      });

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "Smart Study Assistant",
          address: process.env.GMAIL_USER,
        },
        to: email,
        subject: "🔐 Mã xác thực đăng ký tài khoản",
        html: htmlContent,
        priority: "high",
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Registration OTP sent successfully to ${email}:`,
        result.messageId
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Failed to send registration OTP to ${email}:`, error);
      throw new Error(`Không thể gửi email xác thực: ${error.message}`);
    }
  }

  // Send OTP for password reset
  async sendPasswordResetOTP(email, otp, expiryMinutes = 5) {
    try {
      const template = this.loadTemplate("password-reset-otp");
      if (!template) {
        throw new Error("Password reset OTP template not found");
      }

      const htmlContent = this.replacePlaceholders(template, {
        otp: otp,
        expiryMinutes: expiryMinutes,
        email: email,
        currentYear: new Date().getFullYear(),
        appName: "Smart Study Assistant",
      });

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "Smart Study Assistant",
          address: process.env.GMAIL_USER,
        },
        to: email,
        subject: "🔑 Mã xác thực đặt lại mật khẩu",
        html: htmlContent,
        priority: "high",
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Password reset OTP sent successfully to ${email}:`,
        result.messageId
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Failed to send password reset OTP to ${email}:`, error);
      throw new Error(`Không thể gửi email đặt lại mật khẩu: ${error.message}`);
    }
  }

  // Send welcome email after successful registration
  async sendWelcomeEmail(email, name) {
    try {
      const template = this.loadTemplate("welcome");
      if (!template) {
        console.log("Welcome template not found, skipping welcome email");
        return { success: true, skipped: true };
      }

      const htmlContent = this.replacePlaceholders(template, {
        name: name || email.split("@")[0],
        email: email,
        currentYear: new Date().getFullYear(),
        appName: "Smart Study Assistant",
      });

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "Smart Study Assistant",
          address: process.env.GMAIL_USER,
        },
        to: email,
        subject: "🎉 Chào mừng bạn đến với Smart Study Assistant!",
        html: htmlContent,
        priority: "normal",
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Welcome email sent successfully to ${email}:`,
        result.messageId
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${email}:`, error);
      // Don't throw error for welcome email as it's not critical
      return { success: false, error: error.message };
    }
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: "Email service connection is working" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
