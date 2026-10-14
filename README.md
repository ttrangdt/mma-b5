# Contact Management App - Enhanced SQLite (MMA301)

Ứng dụng quản lý danh bạ xây dựng bằng **React Native & SQLite** theo yêu cầu của bài Lab **"Enhance SQLite Database in a React Native App"**.

## ✨ Tính năng chính (CRUD & Tối ưu SQLite)
- **Create (Thêm mới)**: Thêm liên hệ vào SQLite database với các trường `name`, `phone`, `email`.
- **Read (Truy vấn & Tìm kiếm)**: Đọc toàn bộ danh sách liên hệ hoặc tìm kiếm theo tên/số điện thoại theo thời gian thực.
- **Update (Chỉnh sửa)**: Cập nhật thông tin liên hệ trong bảng SQLite.
- **Delete (Xóa)**: Xóa liên hệ với hộp thoại xác nhận.
- **Performance Optimization (Tối ưu hiệu năng)**:
  - Tạo chỉ mục `CREATE INDEX idx_contacts_name ON contacts(name)` giúp tăng tốc độ tìm kiếm.
  - Sử dụng **Transaction** (`BEGIN TRANSACTION ... COMMIT`) cho các thao tác thêm hàng loạt dữ liệu mẫu (Seed Data).
- **Clean Architecture & No Local Assets**: 
  - Toàn bộ avatar sử dụng API online (`ui-avatars.com`).
  - Sử dụng vector icons từ `@expo/vector-icons` có sẵn trong Expo Snack.
  - Tương thích 100% với Expo Snack và Expo Go.

## 🚀 Cách chạy trên Expo Snack
1. Truy cập [https://snack.expo.dev](https://snack.expo.dev)
2. Nhấn vào biểu tượng **Import from Git** hoặc copy toàn bộ nội dung file `App.js` và `package.json` vào Snack.
3. Nhấn **Save** để nhận link Snack và rút gọn qua Bitly để nộp bài.
