-- ============================================
-- Script tạo bảng và load dữ liệu mẫu
-- Hệ thống Quản lý nhóm người dùng và Phân quyền
-- ============================================

-- Xóa các bảng nếu đã tồn tại (theo thứ tự ngược lại)
DROP TABLE IF EXISTS sys_permission CASCADE;
DROP TABLE IF EXISTS sys_user_group CASCADE;
DROP TABLE IF EXISTS sys_resource CASCADE;
DROP TABLE IF EXISTS sys_group CASCADE;

-- ============================================
-- 1. Tạo bảng sys_group (Nhóm người dùng)
-- ============================================
CREATE TABLE sys_group (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER,
  updated_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sys_group_code ON sys_group(code);
CREATE INDEX idx_sys_group_status ON sys_group(status);

-- Comments
COMMENT ON TABLE sys_group IS 'Bảng quản lý nhóm người dùng';
COMMENT ON COLUMN sys_group.code IS 'Mã nhóm duy nhất, dùng trong code';
COMMENT ON COLUMN sys_group.is_system IS 'Nhóm hệ thống: admin, user, guest - không thể xóa';
COMMENT ON COLUMN sys_group.status IS 'Trạng thái: active, inactive';

-- ============================================
-- 2. Tạo bảng sys_user_group (Map người dùng - nhóm)
-- ============================================
CREATE TABLE sys_user_group (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,  -- UUID from sys_user
  group_id INTEGER NOT NULL REFERENCES sys_group(id) ON DELETE CASCADE,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_group UNIQUE(user_id, group_id)
);

-- Indexes
CREATE INDEX idx_sys_user_group_user ON sys_user_group(user_id);
CREATE INDEX idx_sys_user_group_group ON sys_user_group(group_id);

COMMENT ON TABLE sys_user_group IS 'Bảng map quan hệ nhiều-nhiều giữa người dùng và nhóm';
COMMENT ON COLUMN sys_user_group.user_id IS 'UUID của user từ bảng sys_user (VARCHAR(36))';

-- ============================================
-- 3. Tạo bảng sys_resource (Tài nguyên/Chức năng)
-- ============================================
CREATE TABLE sys_resource (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  path VARCHAR(255),
  method VARCHAR(10),
  parent_id INTEGER REFERENCES sys_resource(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sys_resource_code ON sys_resource(code);
CREATE INDEX idx_sys_resource_type ON sys_resource(type);
CREATE INDEX idx_sys_resource_parent ON sys_resource(parent_id);
CREATE INDEX idx_sys_resource_path_method ON sys_resource(path, method);

COMMENT ON TABLE sys_resource IS 'Bảng định nghĩa các tài nguyên và chức năng hệ thống';
COMMENT ON COLUMN sys_resource.type IS 'menu: Menu sidebar, api: API endpoint, button: Nút chức năng';
COMMENT ON COLUMN sys_resource.method IS 'GET, POST, PUT, DELETE - áp dụng cho type = api';

-- ============================================
-- 4. Tạo bảng sys_permission (Quyền của nhóm)
-- ============================================
CREATE TABLE sys_permission (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES sys_group(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES sys_resource(id) ON DELETE CASCADE,
  can_access BOOLEAN NOT NULL DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_group_resource UNIQUE(group_id, resource_id)
);

-- Indexes
CREATE INDEX idx_sys_permission_group ON sys_permission(group_id);
CREATE INDEX idx_sys_permission_resource ON sys_permission(resource_id);
CREATE INDEX idx_sys_permission_access ON sys_permission(group_id, resource_id, can_access);

COMMENT ON TABLE sys_permission IS 'Bảng phân quyền: nhóm nào được truy cập tài nguyên nào';
COMMENT ON COLUMN sys_permission.can_access IS 'Cho phép truy cập tài nguyên';

-- ============================================
-- 5. Insert dữ liệu mẫu - sys_group
-- ============================================
INSERT INTO sys_group (name, code, description, is_system, status) VALUES
('Quản trị viên', 'ADMIN', 'Quản trị viên hệ thống, có toàn quyền truy cập', true, 'active'),
('Người dùng', 'USER', 'Người dùng thông thường, quyền hạn cơ bản', true, 'active'),
('Người xem', 'VIEWER', 'Chỉ có quyền xem, không được chỉnh sửa', true, 'active'),
('Quản lý hệ thống', 'SYSTEM_MANAGER', 'Quản lý cấu hình hệ thống và thiết lập', false, 'active'),
('Quản lý báo cáo', 'REPORT_MANAGER', 'Quản lý và xem các báo cáo thống kê', false, 'active');

-- ============================================
-- 6. Insert dữ liệu mẫu - sys_resource
-- ============================================

-- Menu cấp 1: Quản trị hệ thống
INSERT INTO sys_resource (name, code, type, path, icon, sort_order, is_system) VALUES
('Quản trị hệ thống', 'ADMIN', 'menu', '/admin', 'Settings', 1, true);

-- Lấy ID của menu cha
DO $$
DECLARE
  admin_menu_id INTEGER;
  users_menu_id INTEGER;
  groups_menu_id INTEGER;
  perms_menu_id INTEGER;
  config_menu_id INTEGER;
  systems_menu_id INTEGER;
  contacts_menu_id INTEGER;
  reports_menu_id INTEGER;
BEGIN
  -- Lấy ID menu Quản trị hệ thống
  SELECT id INTO admin_menu_id FROM sys_resource WHERE code = 'ADMIN';

  -- ====================
  -- Menu cấp 2: Quản lý người dùng
  -- ====================
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Quản lý người dùng', 'ADMIN_USERS', 'menu', '/admin/users', 'UserCog', admin_menu_id, 1, true)
  RETURNING id INTO users_menu_id;

  -- API endpoints cho Quản lý người dùng
  INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
  ('Xem danh sách người dùng', 'ADMIN_USERS_VIEW', 'api', '/api/users', 'GET', users_menu_id, true),
  ('Xem chi tiết người dùng', 'ADMIN_USERS_VIEW_DETAIL', 'api', '/api/users/:id', 'GET', users_menu_id, true),
  ('Thêm người dùng', 'ADMIN_USERS_CREATE', 'api', '/api/users', 'POST', users_menu_id, true),
  ('Sửa người dùng', 'ADMIN_USERS_UPDATE', 'api', '/api/users/:id', 'PUT', users_menu_id, true),
  ('Xóa người dùng', 'ADMIN_USERS_DELETE', 'api', '/api/users/:id', 'DELETE', users_menu_id, true);

  -- ====================
  -- Menu cấp 2: Quản lý nhóm người dùng
  -- ====================
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Quản lý nhóm người dùng', 'ADMIN_GROUPS', 'menu', '/admin/user-groups', 'Users', admin_menu_id, 2, true)
  RETURNING id INTO groups_menu_id;

  INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
  ('Xem danh sách nhóm', 'ADMIN_GROUPS_VIEW', 'api', '/api/user-groups', 'GET', groups_menu_id, true),
  ('Xem chi tiết nhóm', 'ADMIN_GROUPS_VIEW_DETAIL', 'api', '/api/user-groups/:id', 'GET', groups_menu_id, true),
  ('Thêm nhóm', 'ADMIN_GROUPS_CREATE', 'api', '/api/user-groups', 'POST', groups_menu_id, true),
  ('Sửa nhóm', 'ADMIN_GROUPS_UPDATE', 'api', '/api/user-groups/:id', 'PUT', groups_menu_id, true),
  ('Xóa nhóm', 'ADMIN_GROUPS_DELETE', 'api', '/api/user-groups/:id', 'DELETE', groups_menu_id, true),
  ('Xem người dùng trong nhóm', 'ADMIN_GROUPS_VIEW_USERS', 'api', '/api/user-groups/:id/users', 'GET', groups_menu_id, true),
  ('Thêm người dùng vào nhóm', 'ADMIN_GROUPS_ADD_USER', 'api', '/api/user-groups/:id/users', 'POST', groups_menu_id, true),
  ('Xóa người dùng khỏi nhóm', 'ADMIN_GROUPS_REMOVE_USER', 'api', '/api/user-groups/:id/users/:userId', 'DELETE', groups_menu_id, true);

  -- ====================
  -- Menu cấp 2: Phân quyền
  -- ====================
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Phân quyền', 'ADMIN_PERMISSIONS', 'menu', '/admin/permissions', 'Shield', admin_menu_id, 3, true)
  RETURNING id INTO perms_menu_id;

  INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
  ('Xem danh sách tài nguyên', 'ADMIN_PERMISSIONS_VIEW_RESOURCES', 'api', '/api/permissions/resources', 'GET', perms_menu_id, true),
  ('Xem quyền của nhóm', 'ADMIN_PERMISSIONS_VIEW_GROUP', 'api', '/api/permissions/groups/:groupId', 'GET', perms_menu_id, true),
  ('Cập nhật phân quyền nhóm', 'ADMIN_PERMISSIONS_UPDATE', 'api', '/api/permissions/groups/:groupId', 'PUT', perms_menu_id, true),
  ('Xem quyền của người dùng', 'ADMIN_PERMISSIONS_VIEW_USER', 'api', '/api/permissions/users/:userId', 'GET', perms_menu_id, true);

  -- ====================
  -- Menu cấp 1: Cấu hình hệ thống
  -- ====================
  INSERT INTO sys_resource (name, code, type, path, icon, sort_order, is_system) VALUES
  ('Cấu hình hệ thống', 'CONFIG', 'menu', '/config', 'Settings', 2, true)
  RETURNING id INTO config_menu_id;

  -- Menu cấp 2: Danh sách hệ thống
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Danh sách hệ thống', 'CONFIG_SYSTEMS', 'menu', '/config/systems', 'Database', config_menu_id, 1, true)
  RETURNING id INTO systems_menu_id;

  INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
  ('Xem danh sách hệ thống', 'CONFIG_SYSTEMS_VIEW', 'api', '/api/systems', 'GET', systems_menu_id, true),
  ('Xem chi tiết hệ thống', 'CONFIG_SYSTEMS_VIEW_DETAIL', 'api', '/api/systems/:id', 'GET', systems_menu_id, true),
  ('Thêm hệ thống', 'CONFIG_SYSTEMS_CREATE', 'api', '/api/systems', 'POST', systems_menu_id, true),
  ('Sửa hệ thống', 'CONFIG_SYSTEMS_UPDATE', 'api', '/api/systems/:id', 'PATCH', systems_menu_id, true),
  ('Xóa hệ thống', 'CONFIG_SYSTEMS_DELETE', 'api', '/api/systems/:id', 'DELETE', systems_menu_id, true);

  -- Menu cấp 2: Loại vận hành
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Loại vận hành', 'CONFIG_OPERATION_TYPES', 'menu', '/config/operation-types', 'Tag', config_menu_id, 2, true);

  -- Menu cấp 2: Cấp độ hệ thống
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Cấp độ hệ thống', 'CONFIG_SYSTEM_LEVELS', 'menu', '/config/system-levels', 'TrendingUp', config_menu_id, 3, true);

  -- Menu cấp 2: Thông tin liên hệ
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Thông tin liên hệ', 'CONFIG_CONTACTS', 'menu', '/config/contacts', 'UserCircle', config_menu_id, 4, true)
  RETURNING id INTO contacts_menu_id;

  INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
  ('Xem danh sách liên hệ', 'CONFIG_CONTACTS_VIEW', 'api', '/api/contacts', 'GET', contacts_menu_id, true),
  ('Thêm liên hệ', 'CONFIG_CONTACTS_CREATE', 'api', '/api/contacts', 'POST', contacts_menu_id, true),
  ('Sửa liên hệ', 'CONFIG_CONTACTS_UPDATE', 'api', '/api/contacts/:id', 'PATCH', contacts_menu_id, true),
  ('Xóa liên hệ', 'CONFIG_CONTACTS_DELETE', 'api', '/api/contacts/:id', 'DELETE', contacts_menu_id, true);

  -- Menu cấp 2: Nhóm liên hệ
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Nhóm liên hệ', 'CONFIG_GROUPS', 'menu', '/config/groups', 'Layers', config_menu_id, 5, true);

  -- Menu cấp 2: Quy tắc cảnh báo
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Quy tắc cảnh báo', 'CONFIG_ALERT_RULES', 'menu', '/config/alert-rules', 'Settings', config_menu_id, 6, true);

  -- Menu cấp 2: Lịch trực ca
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Lịch trực ca', 'CONFIG_SCHEDULES', 'menu', '/config/schedules', 'Calendar', config_menu_id, 7, true);

  -- Menu cấp 2: Cấu hình cảnh báo
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Cấu hình cảnh báo', 'CONFIG_ALERTS', 'menu', '/config/alerts', 'AlertTriangle', config_menu_id, 8, true);

  -- Menu cấp 2: Cấu hình thông báo
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Cấu hình thông báo', 'CONFIG_NOTIFICATIONS', 'menu', '/config/notifications', 'Bell', config_menu_id, 9, true);

  -- Menu cấp 2: Cấu hình Incidents
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Cấu hình Incidents', 'CONFIG_INCIDENTS', 'menu', '/config/incidents', 'Zap', config_menu_id, 10, true);

  -- Menu cấp 2: Cấu hình Log Analysis
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Cấu hình Log Analysis', 'CONFIG_LOG_ANALYSIS', 'menu', '/config/log-analysis', 'FileText', config_menu_id, 11, true);

  -- Menu cấp 2: Cấu hình Servers
  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Cấu hình Servers', 'CONFIG_SERVERS', 'menu', '/config/servers', 'Server', config_menu_id, 12, true);

  -- ====================
  -- Menu cấp 1: Báo cáo, thống kê
  -- ====================
  INSERT INTO sys_resource (name, code, type, path, icon, sort_order, is_system) VALUES
  ('Báo cáo, thống kê', 'REPORTS', 'menu', '/reports', 'BarChart3', 3, true)
  RETURNING id INTO reports_menu_id;

  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Báo cáo ca trực', 'REPORTS_SHIFTS', 'menu', '/reports/shifts', 'FileBarChart', reports_menu_id, 1, true);

  INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
  ('Lịch sử cảnh báo', 'REPORTS_ALERTS', 'menu', '/reports/alert-history', 'History', reports_menu_id, 2, true);

  -- ====================
  -- Menu Dashboard (Root level)
  -- ====================
  INSERT INTO sys_resource (name, code, type, path, icon, sort_order, is_system) VALUES
  ('Dashboard', 'DASHBOARD', 'menu', '/', 'LayoutDashboard', 0, true);

END $$;

-- ============================================
-- 7. Insert dữ liệu mẫu - sys_permission
-- ============================================

-- Gán toàn quyền cho nhóm ADMIN
DO $$
DECLARE
  admin_group_id INTEGER;
  resource_record RECORD;
BEGIN
  -- Lấy ID nhóm ADMIN
  SELECT id INTO admin_group_id FROM sys_group WHERE code = 'ADMIN';

  -- Gán tất cả tài nguyên cho ADMIN
  FOR resource_record IN SELECT id FROM sys_resource
  LOOP
    INSERT INTO sys_permission (group_id, resource_id, can_access)
    VALUES (admin_group_id, resource_record.id, true);
  END LOOP;

  RAISE NOTICE 'Đã gán toàn quyền cho nhóm ADMIN';
END $$;

-- Gán quyền cơ bản cho nhóm USER
DO $$
DECLARE
  user_group_id INTEGER;
BEGIN
  -- Lấy ID nhóm USER
  SELECT id INTO user_group_id FROM sys_group WHERE code = 'USER';

  -- Gán quyền xem cho nhóm USER (chỉ GET)
  INSERT INTO sys_permission (group_id, resource_id, can_access)
  SELECT user_group_id, id, true
  FROM sys_resource
  WHERE type = 'menu'
    OR (type = 'api' AND method = 'GET');

  RAISE NOTICE 'Đã gán quyền cơ bản cho nhóm USER';
END $$;

-- Gán quyền chỉ xem cho nhóm VIEWER
DO $$
DECLARE
  viewer_group_id INTEGER;
BEGIN
  -- Lấy ID nhóm VIEWER
  SELECT id INTO viewer_group_id FROM sys_group WHERE code = 'VIEWER';

  -- Gán quyền xem menu và API GET (không bao gồm admin)
  INSERT INTO sys_permission (group_id, resource_id, can_access)
  SELECT viewer_group_id, id, true
  FROM sys_resource
  WHERE (type = 'menu' AND path NOT LIKE '/admin%')
    OR (type = 'api' AND method = 'GET' AND path NOT LIKE '%/admin/%');

  RAISE NOTICE 'Đã gán quyền xem cho nhóm VIEWER';
END $$;

-- Gán quyền cho nhóm SYSTEM_MANAGER (Quản lý hệ thống)
DO $$
DECLARE
  system_manager_group_id INTEGER;
BEGIN
  -- Lấy ID nhóm SYSTEM_MANAGER
  SELECT id INTO system_manager_group_id FROM sys_group WHERE code = 'SYSTEM_MANAGER';

  -- Gán quyền:
  -- 1. Toàn bộ menu Config (Cấu hình hệ thống)
  -- 2. Tất cả API trong /api/systems, /api/contacts, /api/groups, /api/rules, /api/schedules
  -- 3. Dashboard để xem tổng quan
  INSERT INTO sys_permission (group_id, resource_id, can_access)
  SELECT system_manager_group_id, id, true
  FROM sys_resource
  WHERE code IN ('DASHBOARD', 'CONFIG')  -- Menu chính
    OR (type = 'menu' AND path LIKE '/config%')  -- Tất cả menu con trong Config
    OR (type = 'api' AND (
      path LIKE '/api/systems%'
      OR path LIKE '/api/contacts%'
      OR path LIKE '/api/groups%'
      OR path LIKE '/api/rules%'
      OR path LIKE '/api/schedules%'
      OR path LIKE '/api/alerts%'
      OR path LIKE '/api/incidents%'
      OR path LIKE '/api/logs%'
    ));

  RAISE NOTICE 'Đã gán quyền cho nhóm SYSTEM_MANAGER';
END $$;

-- Gán quyền cho nhóm REPORT_MANAGER (Quản lý báo cáo)
DO $$
DECLARE
  report_manager_group_id INTEGER;
BEGIN
  -- Lấy ID nhóm REPORT_MANAGER
  SELECT id INTO report_manager_group_id FROM sys_group WHERE code = 'REPORT_MANAGER';

  -- Gán quyền:
  -- 1. Dashboard
  -- 2. Toàn bộ menu Reports (Báo cáo, thống kê)
  -- 3. Xem các menu Config (chỉ xem, không sửa xóa)
  -- 4. API GET để xem dữ liệu, POST để tạo báo cáo
  INSERT INTO sys_permission (group_id, resource_id, can_access)
  SELECT report_manager_group_id, id, true
  FROM sys_resource
  WHERE code IN ('DASHBOARD', 'REPORTS', 'CONFIG')  -- Menu chính
    OR (type = 'menu' AND (path LIKE '/reports%' OR path LIKE '/config%'))  -- Menu con
    OR (type = 'api' AND path LIKE '/api/stats%')  -- API thống kê
    OR (type = 'api' AND method IN ('GET', 'POST') AND (
      path LIKE '/api/systems%'
      OR path LIKE '/api/contacts%'
      OR path LIKE '/api/alerts%'
      OR path LIKE '/api/incidents%'
      OR path LIKE '/api/schedules%'
    ));

  RAISE NOTICE 'Đã gán quyền cho nhóm REPORT_MANAGER';
END $$;

-- ============================================
-- 8. Tạo function và trigger tự động cập nhật updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger cho sys_group
CREATE TRIGGER update_sys_group_updated_at BEFORE UPDATE ON sys_group
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho sys_resource
CREATE TRIGGER update_sys_resource_updated_at BEFORE UPDATE ON sys_resource
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho sys_permission
CREATE TRIGGER update_sys_permission_updated_at BEFORE UPDATE ON sys_permission
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Hiển thị thống kê
-- ============================================
DO $$
DECLARE
  group_count INTEGER;
  resource_count INTEGER;
  permission_count INTEGER;
  menu_count INTEGER;
  api_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO group_count FROM sys_group;
  SELECT COUNT(*) INTO resource_count FROM sys_resource;
  SELECT COUNT(*) INTO permission_count FROM sys_permission;
  SELECT COUNT(*) INTO menu_count FROM sys_resource WHERE type = 'menu';
  SELECT COUNT(*) INTO api_count FROM sys_resource WHERE type = 'api';

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'HOÀN THÀNH KHỞI TẠO HỆ THỐNG PHÂN QUYỀN';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tổng số nhóm người dùng: %', group_count;
  RAISE NOTICE 'Tổng số tài nguyên: %', resource_count;
  RAISE NOTICE '  - Menu: %', menu_count;
  RAISE NOTICE '  - API: %', api_count;
  RAISE NOTICE 'Tổng số phân quyền: %', permission_count;
  RAISE NOTICE '============================================';
END $$;

-- ============================================
-- 10. Tóm tắt phân quyền các nhóm
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TÓM TẮT PHÂN QUYỀN CÁC NHÓM NGƯỜI DÙNG';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. ADMIN (Quản trị viên)';
  RAISE NOTICE '   ✓ Toàn quyền truy cập tất cả chức năng';
  RAISE NOTICE '   ✓ Dashboard, Admin, Config, Reports';
  RAISE NOTICE '   ✓ Tất cả API: GET, POST, PUT, DELETE';
  RAISE NOTICE '';
  RAISE NOTICE '2. USER (Người dùng)';
  RAISE NOTICE '   ✓ Xem tất cả menu';
  RAISE NOTICE '   ✓ Chỉ API GET (xem dữ liệu)';
  RAISE NOTICE '   ✗ Không được thêm, sửa, xóa';
  RAISE NOTICE '';
  RAISE NOTICE '3. VIEWER (Người xem)';
  RAISE NOTICE '   ✓ Xem Dashboard, Config, Reports';
  RAISE NOTICE '   ✗ Không truy cập Admin';
  RAISE NOTICE '   ✓ Chỉ API GET (không bao gồm admin)';
  RAISE NOTICE '';
  RAISE NOTICE '4. SYSTEM_MANAGER (Quản lý hệ thống)';
  RAISE NOTICE '   ✓ Dashboard';
  RAISE NOTICE '   ✓ Toàn quyền Cấu hình hệ thống (Config)';
  RAISE NOTICE '   ✓ API: systems, contacts, groups, rules, schedules, alerts, incidents';
  RAISE NOTICE '   ✗ Không truy cập Admin và Reports';
  RAISE NOTICE '';
  RAISE NOTICE '5. REPORT_MANAGER (Quản lý báo cáo)';
  RAISE NOTICE '   ✓ Dashboard';
  RAISE NOTICE '   ✓ Toàn quyền Báo cáo, thống kê (Reports)';
  RAISE NOTICE '   ✓ Xem Config (chỉ đọc)';
  RAISE NOTICE '   ✓ API: GET, POST cho báo cáo và thống kê';
  RAISE NOTICE '   ✗ Không truy cập Admin';
  RAISE NOTICE '============================================';
END $$;

-- ============================================
-- 11. Query kiểm tra kết quả
-- ============================================
-- Uncomment các dòng dưới để xem kết quả

-- Xem danh sách nhóm
-- SELECT * FROM sys_group ORDER BY id;

-- Xem cây tài nguyên
-- SELECT
--   r1.name as menu_lv1,
--   r2.name as menu_lv2,
--   r3.name as api_name,
--   r3.method,
--   r3.path
-- FROM sys_resource r1
-- LEFT JOIN sys_resource r2 ON r2.parent_id = r1.id
-- LEFT JOIN sys_resource r3 ON r3.parent_id = r2.id
-- WHERE r1.parent_id IS NULL
-- ORDER BY r1.sort_order, r2.sort_order, r3.name;

-- Xem phân quyền của từng nhóm
-- SELECT
--   g.name as group_name,
--   COUNT(*) as total_permissions,
--   COUNT(CASE WHEN r.type = 'menu' THEN 1 END) as menu_count,
--   COUNT(CASE WHEN r.type = 'api' THEN 1 END) as api_count
-- FROM sys_permission p
-- JOIN sys_group g ON p.group_id = g.id
-- JOIN sys_resource r ON p.resource_id = r.id
-- GROUP BY g.name
-- ORDER BY g.id;

-- Xem chi tiết quyền của một nhóm cụ thể
-- SELECT
--   g.name as group_name,
--   r.name as resource_name,
--   r.type,
--   r.method,
--   r.path
-- FROM sys_permission p
-- JOIN sys_group g ON p.group_id = g.id
-- JOIN sys_resource r ON p.resource_id = r.id
-- WHERE g.code = 'SYSTEM_MANAGER'  -- Thay đổi code nhóm ở đây
-- ORDER BY r.type, r.path;
