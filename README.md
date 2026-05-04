# 📚 Smart Study Assistant

**Smart Study Assistant** là một nền tảng hỗ trợ học tập thông minh và toàn diện, ứng dụng trí tuệ nhân tạo (AI) để mang lại trải nghiệm cá nhân hóa cho người dùng. Dự án bao gồm một hệ thống Backend mạnh mẽ, một ứng dụng di động (Mobile App) cho người học và một trang quản trị (Admin Dashboard) dành cho người quản lý.

---

## 🏗 Cấu trúc dự án

Dự án được tổ chức theo kiến trúc đa nền tảng (Monorepo/Multi-package) bao gồm các thành phần chính:

### 1. `backend/` (API Server)
- **Công nghệ chính**: Node.js, Express.js
- **Cơ sở dữ liệu**: MongoDB với Prisma ORM
- **Tích hợp AI**: Google Gemini AI (`@google/generative-ai`)
- **Chức năng nổi bật**:
  - Quản lý người dùng, phân quyền (User/Admin)
  - Xác thực qua JWT và Google OAuth, gửi OTP (`nodemailer`)
  - Quản lý tài nguyên học tập: Ghi chú (Notes), Thẻ ghi nhớ (Flashcards), Bộ thẻ (Decks), Kế hoạch học tập (Study Plans)
  - Theo dõi tiến trình học tập (Progress)
  - Giao tiếp trực tiếp với AI và lưu trữ lịch sử tương tác (AiLogs)

### 2. `frontend/smart-study-assistant/` (Ứng dụng di động)
- **Công nghệ chính**: React Native, Expo
- **Quản lý trạng thái**: Redux Toolkit
- **UI/UX**: React Native Paper, React Navigation, Expo Haptics, SVG & Recharts
- **Chức năng nổi bật**:
  - Hỗ trợ đa ngôn ngữ (`i18next`)
  - Chuyển văn bản thành giọng nói (`expo-speech`)
  - Tích hợp lịch và thống kê tiến độ học tập
  - Xử lý xác thực người dùng an toàn (`expo-auth-session`)

### 3. `admin-dashboard/` (Trang quản trị)
- **Công nghệ chính**: Next.js 15 (Turbopack), React 19
- **Quản lý trạng thái & Data Fetching**: Zustand, TanStack React Query
- **Giao diện**: Tailwind CSS v4, Radix UI, Lucide Icons
- **Chức năng nổi bật**:
  - Quản lý dữ liệu người dùng, báo cáo và hệ thống
  - Biểu đồ thống kê trực quan với `recharts`
  - Forms với `react-hook-form` & `zod`

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- **Node.js**: Phiên bản >= 18.x
- **MongoDB**: Chạy local hoặc sử dụng MongoDB Atlas
- **Expo CLI**: Để chạy ứng dụng di động

### 🛠 1. Cài đặt Backend
```bash
cd backend
npm install
# Tạo file .env dựa trên .env.example và điền các thông tin như DATABASE_URL, GEMINI_API_KEY,...
npx prisma generate
npx prisma db push
npm run dev
```
*Server sẽ chạy tại `http://localhost:xxxx`*

### 📱 2. Cài đặt Mobile App (Frontend)
```bash
cd frontend/smart-study-assistant
npm install
# Tạo file .env dựa trên .env.example
npx expo start
```
*Bạn có thể quét mã QR bằng ứng dụng Expo Go trên điện thoại hoặc chạy trình giả lập Android/iOS.*

### 💻 3. Cài đặt Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
```
*Trang quản trị sẽ chạy tại `http://localhost:3000`*

---

## 🗄 Lược đồ cơ sở dữ liệu (Database Schema)

Hệ thống lưu trữ các thực thể chính sau (thông qua Prisma & MongoDB):
- **User**: Quản lý tài khoản, phân quyền (User/Admin), thông tin cá nhân.
- **Deck & Flashcard**: Hệ thống thẻ ghi nhớ.
- **StudyPlan & Note**: Lập kế hoạch học tập và tạo ghi chú liên kết với kế hoạch.
- **Progress**: Theo dõi điểm số và tiến độ của người học.
- **AiLog**: Nhật ký các cuộc hội thoại/tương tác giữa người dùng và AI.
- **Permission & RolePermission**: Hệ thống phân quyền động cho Admin.

---

## 🛡 License
Dự án được thiết kế cho mục đích học tập và phát triển cá nhân. Vui lòng tham khảo các license liên quan trong từng package.
