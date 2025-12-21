-- FIX LOG ENTRIES PERMISSION
-- Script này sẽ thêm resource LOG_ENTRIES và cấp quyền cho role ADMIN

-- 1. Thêm resource LOG_ENTRIES (nếu chưa có)
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'LOG_ENTRIES', 'Tra cứu Log hệ thống', 'Quản lý và tra cứu log entries từ các hệ thống giám sát', 1, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM resources WHERE code = 'LOG_ENTRIES'
);

-- 2. Lấy ID của resource LOG_ENTRIES
SET @log_entries_resource_id = (SELECT id FROM resources WHERE code = 'LOG_ENTRIES' LIMIT 1);

-- 3. Cấp quyền READ cho role ADMIN (giả sử ADMIN có id = 1)
-- Nếu role ADMIN có id khác, thay đổi số 1 bên dưới
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @log_entries_resource_id, 1, 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @log_entries_resource_id
);

-- 4. Kiểm tra xem đã cấp quyền thành công chưa
SELECT
    r.name AS role_name,
    res.code AS resource_code,
    res.name AS resource_name,
    rp.can_read,
    rp.can_create,
    rp.can_update,
    rp.can_delete
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN resources res ON rp.resource_id = res.id
WHERE res.code = 'LOG_ENTRIES';

-- LUU Y:
-- - Nếu role ADMIN không có id = 1, hãy tìm ID đúng bằng lệnh:
--   SELECT id, name FROM roles WHERE name LIKE '%ADMIN%';
-- - Sau đó thay đổi số 1 trong INSERT statement ở bước 3
-- - Nếu bạn muốn cấp quyền cho nhiều roles, repeat bước 3 với các role_id khác
