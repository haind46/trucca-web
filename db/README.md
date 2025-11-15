# Database Initialization Scripts

## File: `init_permissions.sql`

Script khởi tạo hệ thống phân quyền với đầy đủ menu và API endpoints.

### Tính năng

✅ **Có thể chạy lại nhiều lần** - Script tự động xóa dữ liệu cũ và insert lại
✅ **Đầy đủ menu** - Bao gồm tất cả menu trong AppSidebar
✅ **Đầy đủ API** - Định nghĩa endpoints cho mỗi chức năng
✅ **5 nhóm người dùng** - ADMIN, USER, VIEWER, SYSTEM_MANAGER, REPORT_MANAGER
✅ **Phân quyền tự động** - Gán quyền phù hợp cho từng nhóm

### Cấu trúc Menu

#### I. Quản trị hệ thống (Admin)
- Dashboard
- Quản lý người dùng (với các API: view, create, update, delete)
- Quản lý nhóm người dùng (với các API đầy đủ)
- Quản lý đơn vị
- Phân quyền (resources & permissions)

#### II. Cấu hình hệ thống (Config) - 12 menu
1. Danh sách hệ thống
2. Loại vận hành
3. Cấp độ hệ thống
4. Thông tin liên hệ
5. Nhóm liên hệ
6. Quy tắc cảnh báo
7. Lịch trực ca
8. Cấu hình cảnh báo
9. Cấu hình thông báo
10. Cấu hình Incidents
11. Cấu hình Log Analysis
12. Cấu hình Servers

#### III. Báo cáo, thống kê (Reports)
- Báo cáo ca trực (view, export)
- Lịch sử cảnh báo (view, export)

### Nhóm người dùng và quyền hạn

| Nhóm | Code | Quyền hạn |
|------|------|-----------|
| **Quản trị viên** | ADMIN | Toàn quyền tất cả chức năng |
| **Người dùng** | USER | Xem tất cả menu, chỉ API GET |
| **Người xem** | VIEWER | Xem Dashboard/Config/Reports (không admin), chỉ GET |
| **Quản lý hệ thống** | SYSTEM_MANAGER | Dashboard + Toàn quyền Config |
| **Quản lý báo cáo** | REPORT_MANAGER | Dashboard + Reports + Xem Config |

### Cách sử dụng

#### Lần đầu tiên (tạo mới)
```bash
psql -U postgres -d trucca_db -f init_permissions.sql
```

#### Chạy lại (cập nhật dữ liệu)
```bash
psql -U postgres -d trucca_db -f init_permissions.sql
```

Script sẽ:
1. Xóa tất cả dữ liệu trong `sys_permission`, `sys_user_group`, `sys_resource`, `sys_group`
2. Reset sequence về 1
3. Tạo bảng nếu chưa có (CREATE TABLE IF NOT EXISTS)
4. Insert lại dữ liệu đầy đủ

### Kết quả

Sau khi chạy script, bạn sẽ thấy thông báo:

```
============================================
HOÀN THÀNH KHỞI TẠO HỆ THỐNG PHÂN QUYỀN
============================================
Tổng số nhóm người dùng: 5
Tổng số tài nguyên: ~80+
  - Menu: ~20
  - API: ~60+
Tổng số phân quyền: ~200+
============================================
```

### Lưu ý

- Script tự động gán quyền cho tất cả nhóm
- Nhóm ADMIN có toàn quyền
- Các nhóm khác có quyền phù hợp với vai trò
- Tất cả trigger `updated_at` được tạo tự động
- Có thể chạy lại bao nhiêu lần cũng được mà không bị lỗi

### Kiểm tra kết quả

```sql
-- Xem tất cả menu
SELECT id, name, code, type, path FROM sys_resource WHERE type = 'menu' ORDER BY sort_order;

-- Xem quyền của nhóm ADMIN
SELECT r.name, r.type, r.path, r.method
FROM sys_permission p
JOIN sys_resource r ON p.resource_id = r.id
JOIN sys_group g ON p.group_id = g.id
WHERE g.code = 'ADMIN'
ORDER BY r.type, r.path;

-- Xem thống kê phân quyền
SELECT
  g.name as group_name,
  COUNT(*) as total_permissions,
  COUNT(CASE WHEN r.type = 'menu' THEN 1 END) as menu_count,
  COUNT(CASE WHEN r.type = 'api' THEN 1 END) as api_count
FROM sys_permission p
JOIN sys_group g ON p.group_id = g.id
JOIN sys_resource r ON p.resource_id = r.id
GROUP BY g.name
ORDER BY g.id;
```

## Troubleshooting

### Lỗi: relation "sys_group" does not exist
Uncomment các dòng DROP TABLE ở đầu file để tạo lại hoàn toàn.

### Lỗi: duplicate key value
Chạy lại script, phần DELETE sẽ xóa dữ liệu cũ.

### Cần xóa hoàn toàn và tạo lại
Uncomment 4 dòng DROP TABLE ở dòng 25-28:
```sql
DROP TABLE IF EXISTS sys_permission CASCADE;
DROP TABLE IF EXISTS sys_user_group CASCADE;
DROP TABLE IF EXISTS sys_resource CASCADE;
DROP TABLE IF EXISTS sys_group CASCADE;
```
