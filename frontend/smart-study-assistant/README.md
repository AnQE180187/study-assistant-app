# Smart Study Assistant - Frontend

## Kết nối Frontend với Backend

### Cấu hình API

1. **Base URL**: Được cấu hình trong `src/services/api.ts`
   - Mặc định: `http://10.0.2.2:5000/api` (cho Android Emulator)
   - Nếu dùng thiết bị thật: Thay đổi thành IP của máy chủ backend

2. **Authentication**: Token được tự động thêm vào header của tất cả request cần auth

### Các tính năng đã kết nối

#### Authentication
- ✅ Login
- ✅ Register  
- ✅ Forgot Password
- ✅ Logout
- ✅ Token management

#### Deck Management
- ✅ Tạo deck mới
- ✅ Xem danh sách deck (của tôi + công khai)
- ✅ Cập nhật deck
- ✅ Xóa deck
- ✅ Tag management

#### Flashcard Management
- ✅ Tạo flashcard mới
- ✅ Xem danh sách flashcard trong deck
- ✅ Cập nhật flashcard
- ✅ Xóa flashcard
- ✅ Tìm kiếm flashcard
- ✅ Thống kê flashcard
- ✅ Bulk operations
- ✅ Export/Import

#### Flashcard Practice
- ✅ Luyện tập với flashcard
- ✅ Flip card animation
- ✅ Progress tracking
- ✅ Shuffle cards

#### Study Plan (Schedule)
- ✅ Tạo lịch học mới
- ✅ Xem lịch học theo ngày
- ✅ Cập nhật lịch học
- ✅ Xóa lịch học
- ✅ Đánh dấu hoàn thành
- ✅ Calendar view với markers
- ✅ Thống kê completion rate
- ✅ Date range queries

### Cách test

1. **Khởi động backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Khởi động frontend**:
   ```bash
   cd frontend/smart-study-assistant
   npm install
   npx expo start
   ```

3. **Test flow**:
   - Đăng ký tài khoản mới
   - Đăng nhập
   - Tạo deck mới
   - Thêm flashcard vào deck
   - Luyện tập với flashcard
   - Tạo lịch học trong Planner tab
   - Đánh dấu hoàn thành các session

### API Endpoints

#### Study Plan
- `GET /api/studyplans` - Lấy danh sách lịch học (có thể filter theo ngày)
- `POST /api/studyplans` - Tạo lịch học mới
- `PUT /api/studyplans/:id` - Cập nhật lịch học
- `DELETE /api/studyplans/:id` - Xóa lịch học
- `PATCH /api/studyplans/:id/toggle` - Toggle completion status
- `GET /api/studyplans/range` - Lấy lịch học theo khoảng thời gian
- `GET /api/studyplans/stats` - Lấy thống kê

### Debug

- Mở Developer Tools trong Expo để xem console logs
- API calls được log chi tiết trong console
- Token được tự động thêm vào request headers

### Lưu ý

- Đảm bảo backend đang chạy trên port 5000
- Nếu dùng thiết bị thật, cần thay đổi IP trong `api.ts`
- Token được lưu trong AsyncStorage và tự động restore khi restart app
- Study plan sử dụng date format ISO string (YYYY-MM-DD) 