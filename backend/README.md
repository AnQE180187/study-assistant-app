# Smart Study Assistant Backend

Đây là backend API cho ứng dụng Smart Study Assistant, sử dụng Node.js, Express, MongoDB (Prisma ORM).

## Tính năng
- Đăng ký, đăng nhập, xác thực JWT
- CRUD ghi chú (Note)
- (Có thể mở rộng: Flashcard, StudyPlan, Progress, AI...)

## Cài đặt
1. Cài Node.js, MongoDB
2. Cài dependencies:
   ```bash
   npm install
   ```
3. Tạo file `.env` trong thư mục backend:
   ```env
   DATABASE_URL="mongodb://localhost:27017/smart_study_assistant"
   JWT_SECRET="mindmate-secret-key-2024"
   PORT=5000
   ```
4. Khởi tạo Prisma:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```
5. Chạy server:
   ```bash
   npm run dev
   ```

## API mẫu để test với Postman

### Đăng ký
POST /api/users
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

### Đăng nhập
POST /api/users/login
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

### Lấy profile (cần Bearer token)
GET /api/users/profile

### Tạo ghi chú (cần Bearer token)
POST /api/notes
```json
{
  "title": "Note 1",
  "content": "Nội dung ghi chú",
  "category": "Math"
}
```

### Lấy danh sách ghi chú
GET /api/notes

### Xem chi tiết ghi chú
GET /api/notes/:id

### Sửa ghi chú
PUT /api/notes/:id
```json
{
  "title": "Note 1 updated",
  "content": "Nội dung mới",
  "category": "Math"
}
```

### Xóa ghi chú
DELETE /api/notes/:id

## Lưu ý
- Các route /api/notes và /api/users/profile đều cần header: `Authorization: Bearer <token>` lấy từ khi đăng nhập thành công.
