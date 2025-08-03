# Study Assistant Admin Dashboard

Admin dashboard cho ứng dụng Study Assistant, được xây dựng với Next.js 14 và TypeScript.

## 🚀 Tính năng

### ✅ Đã hoàn thành

- **Authentication**: Đăng nhập admin với JWT, middleware bảo vệ routes
- **Dashboard**: Thống kê tổng quan với biểu đồ (users, content, system stats)
- **Quản lý Users**: Xem, tìm kiếm, cập nhật role, xóa users
- **Quản lý Flashcards**: Xem decks, flashcards, thống kê
- **Quản lý Notes**: Xem, tìm kiếm notes theo priority và tags
- **Quản lý AI Logs**: Theo dõi tương tác AI, xem chi tiết, xóa logs

### 🔄 Đang phát triển

- Responsive design optimization
- Dark/Light theme
- Advanced filtering và sorting
- Export data functionality

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Notifications**: Sonner

## 📦 Cài đặt

1. **Clone repository và navigate đến thư mục admin**:

```bash
cd admin-dashboard
```

2. **Cài đặt dependencies**:

```bash
npm install
```

3. **Cấu hình environment variables**:

```bash
# Tạo file .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME="Study Assistant Admin"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

4. **Chạy development server**:

```bash
npm run dev
```

5. **Mở trình duyệt**: http://localhost:3001

## 🔐 Đăng nhập

Sử dụng tài khoản admin đã tạo trong backend:

- Email: admin@example.com
- Password: [mật khẩu admin]
