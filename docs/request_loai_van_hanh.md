- Viết bộ API theo crud-business-rule.md để triển khai tính năng sau:
Quản lý Loại vận hành. với các thông tin:
    + Mã loại vận hành (phần id để tự động tăng, và số nguyên nhé)
    + Tên loại vận hành (Ví dụ: Hệ điều hành (OS), Cơ sở dữ liệu (Database), Ứng dụng (Applications), Mạng (Network)
    + Thông tin mô tả
    + Ghi chú
    + Thời gian tạo, người tạo, thời gian cập nhật, người cập nhật ...
- API viết theo kiểu camelCase để đồng nhất với các tính năng khác. Lưu tài liệu API vào thư mục docs để tôi gửi cho agent frontend code tiếp.
- Viết tài liệu API để đội backend có thể sửa theo, lưu ý host/port là localhost:8002
- Viết thêm file sql để tạo bảng + dữ liệu mẫu đầy đủ cho các loại vận hành vào database nhé trên nhé. lưu file vào thư mục db nhé