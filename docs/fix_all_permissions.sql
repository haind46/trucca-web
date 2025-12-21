-- FIX ALL PERMISSIONS FOR COMMON RESOURCES
-- Script này sẽ thêm các resources thường dùng và cấp quyền cho role ADMIN

-- ============================================
-- 1. THÊM CÁC RESOURCES (nếu chưa có)
-- ============================================

-- LOG_ENTRIES Resource
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'LOG_ENTRIES', 'Tra cứu Log hệ thống', 'Quản lý và tra cứu log entries từ các hệ thống giám sát', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'LOG_ENTRIES');

-- SYSTEMS Resource
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'SYSTEMS', 'Hệ thống', 'Quản lý danh sách các hệ thống giám sát', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'SYSTEMS');

-- ALERTS Resource
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'ALERTS', 'Cảnh báo', 'Quản lý cảnh báo từ hệ thống', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'ALERTS');

-- ALERT_RULES Resource
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'ALERT_RULES', 'Quy tắc cảnh báo', 'Quản lý quy tắc cảnh báo', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'ALERT_RULES');

-- ERROR_DICTIONARY Resource
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'ERROR_DICTIONARY', 'Từ điển lỗi', 'Quản lý từ điển mã lỗi hệ thống', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'ERROR_DICTIONARY');

-- SYSTEM_CATALOGS Resource
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'SYSTEM_CATALOGS', 'Danh mục hệ thống', 'Quản lý danh mục các hệ thống', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'SYSTEM_CATALOGS');

-- SEVERITIES Resource
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'SEVERITIES', 'Mức độ nghiêm trọng', 'Quản lý các mức độ nghiêm trọng', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'SEVERITIES');

-- ============================================
-- 2. LẤY ID CỦA CÁC RESOURCES
-- ============================================

SET @log_entries_id = (SELECT id FROM resources WHERE code = 'LOG_ENTRIES' LIMIT 1);
SET @systems_id = (SELECT id FROM resources WHERE code = 'SYSTEMS' LIMIT 1);
SET @alerts_id = (SELECT id FROM resources WHERE code = 'ALERTS' LIMIT 1);
SET @alert_rules_id = (SELECT id FROM resources WHERE code = 'ALERT_RULES' LIMIT 1);
SET @error_dictionary_id = (SELECT id FROM resources WHERE code = 'ERROR_DICTIONARY' LIMIT 1);
SET @system_catalogs_id = (SELECT id FROM resources WHERE code = 'SYSTEM_CATALOGS' LIMIT 1);
SET @severities_id = (SELECT id FROM resources WHERE code = 'SEVERITIES' LIMIT 1);

-- ============================================
-- 3. CẤP QUYỀN CHO ROLE ADMIN (id = 1)
-- ============================================
-- Thay đổi role_id = 1 nếu ADMIN role có id khác
-- Tìm ID bằng: SELECT id, name FROM roles WHERE name LIKE '%ADMIN%';

-- LOG_ENTRIES - Read only
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @log_entries_id, 1, 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @log_entries_id);

-- SYSTEMS - Full CRUD
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @systems_id, 1, 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @systems_id);

-- ALERTS - Read + Update (acknowledge/resolve)
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @alerts_id, 1, 0, 1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @alerts_id);

-- ALERT_RULES - Full CRUD
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @alert_rules_id, 1, 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @alert_rules_id);

-- ERROR_DICTIONARY - Full CRUD
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @error_dictionary_id, 1, 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @error_dictionary_id);

-- SYSTEM_CATALOGS - Full CRUD
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @system_catalogs_id, 1, 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @system_catalogs_id);

-- SEVERITIES - Full CRUD
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @severities_id, 1, 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @severities_id);

-- ============================================
-- 4. KIỂM TRA KẾT QUẢ
-- ============================================

SELECT
    r.name AS role_name,
    res.code AS resource_code,
    res.name AS resource_name,
    rp.can_read AS 'Read',
    rp.can_create AS 'Create',
    rp.can_update AS 'Update',
    rp.can_delete AS 'Delete'
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN resources res ON rp.resource_id = res.id
WHERE res.code IN ('LOG_ENTRIES', 'SYSTEMS', 'ALERTS', 'ALERT_RULES', 'ERROR_DICTIONARY', 'SYSTEM_CATALOGS', 'SEVERITIES')
ORDER BY res.code;

-- ============================================
-- LƯU Ý
-- ============================================
-- 1. Nếu role ADMIN có id khác 1, tìm ID bằng:
--    SELECT id, name FROM roles WHERE name LIKE '%ADMIN%';
--    Sau đó thay role_id = 1 thành ID đúng
--
-- 2. Để cấp quyền cho roles khác, copy các INSERT statements
--    và thay role_id tương ứng
--
-- 3. Permissions:
--    - can_read = 1: Xem danh sách, chi tiết
--    - can_create = 1: Thêm mới
--    - can_update = 1: Cập nhật
--    - can_delete = 1: Xóa
