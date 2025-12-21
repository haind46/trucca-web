# HƯỚNG DẪN FIX NHANH LỖI 403 - LOG ENTRIES

## Hiện tượng

Truy cập tính năng "Tra cứu Log hệ thống" (`/config/log-entries`) bị lỗi 403 Forbidden.

## Nguyên nhân

User chưa được cấp quyền truy cập resource `LOG_ENTRIES`.

## Cách fix (3 bước)

### Bước 1: Chạy SQL Script

Mở MySQL Workbench hoặc phpMyAdmin và chạy script sau:

```sql
-- Thêm resource LOG_ENTRIES
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'LOG_ENTRIES', 'Tra cứu Log hệ thống', 'Quản lý và tra cứu log entries từ các hệ thống giám sát', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'LOG_ENTRIES');

-- Lấy ID của resource
SET @log_entries_resource_id = (SELECT id FROM resources WHERE code = 'LOG_ENTRIES' LIMIT 1);

-- Cấp quyền cho role ADMIN (thay đổi role_id nếu cần)
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @log_entries_resource_id, 1, 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @log_entries_resource_id);
```

**Lưu ý**:
- Nếu role ADMIN không có `id = 1`, tìm ID đúng bằng: `SELECT id, name FROM roles WHERE name LIKE '%ADMIN%';`
- Thay số `1` trong câu lệnh INSERT bằng ID đúng

### Bước 2: Kiểm tra kết quả

Chạy query này để xác nhận đã cấp quyền:

```sql
SELECT r.name AS role_name, res.code AS resource_code, rp.can_read
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN resources res ON rp.resource_id = res.id
WHERE res.code = 'LOG_ENTRIES';
```

Kết quả mong đợi:
```
role_name | resource_code | can_read
----------|---------------|----------
ADMIN     | LOG_ENTRIES   | 1
```

### Bước 3: Refresh trang web

1. Quay lại trang web
2. Refresh trang (F5 hoặc Ctrl+R)
3. Truy cập lại `/config/log-entries`

## Kết quả

✅ Trang "Tra cứu Log hệ thống" hiển thị bình thường với:
- 4 stats cards (Tổng Log, Critical, High, Medium)
- Bộ lọc nâng cao
- Bảng danh sách log
- Mặc định hiển thị log của ngày hôm nay

## Nếu vẫn bị lỗi

1. Kiểm tra lại role_id của user hiện tại
2. Đảm bảo user đã logout và login lại
3. Clear localStorage: `localStorage.clear()` trong Console
4. Xem chi tiết tại [LOG_ENTRIES_PERMISSION_FIX.md](LOG_ENTRIES_PERMISSION_FIX.md)

## Script SQL đầy đủ

Xem file: [fix_log_entries_permission.sql](fix_log_entries_permission.sql)
