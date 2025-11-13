-- Xóa các bảng nếu đã tồn tại (theo thứ tự ngược để tránh lỗi foreign key)
DROP TABLE IF EXISTS contact_roles CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Bảng roles (vai trò)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng contacts (danh bạ nhân sự)
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    unit VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng contact_roles (mapping nhiều-nhiều giữa contact và role)
CREATE TABLE contact_roles (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contact_id, role_id)
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_unit ON contacts(unit);
CREATE INDEX idx_contacts_is_active ON contacts(is_active);
CREATE INDEX idx_contact_roles_contact ON contact_roles(contact_id);
CREATE INDEX idx_contact_roles_role ON contact_roles(role_id);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_active ON roles(is_active);

-- Insert dữ liệu mẫu cho roles
INSERT INTO roles (name, description, display_order, is_active) VALUES
('Lãnh đạo trung tâm', 'Lãnh đạo cấp trung tâm', 1, true),
('Lãnh đạo Phòng Vận hành', 'Trưởng/Phó phòng Vận hành', 2, true),
('Lãnh đạo Phòng Kỹ thuật', 'Trưởng/Phó phòng Kỹ thuật', 3, true),
('Team Leader', 'Trưởng nhóm/ca', 4, true),
('Bộ phận vận hành', 'Nhân viên vận hành hệ thống', 5, true),
('Bộ phận kỹ thuật', 'Nhân viên kỹ thuật bảo trì', 6, true);

-- Insert dữ liệu mẫu cho contacts
INSERT INTO contacts (full_name, unit, email, phone, is_active) VALUES
('Nguyễn Văn A', 'Ban Giám đốc', 'nguyenvana@company.com', '0901234567', true),
('Trần Thị B', 'Phòng Vận hành', 'tranthib@company.com', '0901234568', true),
('Lê Văn C', 'Phòng Kỹ thuật', 'levanc@company.com', '0901234569', true),
('Phạm Thị D', 'Phòng Vận hành', 'phamthid@company.com', '0901234570', true),
('Hoàng Văn E', 'Phòng Vận hành', 'hoangvane@company.com', '0901234571', true),
('Vũ Thị F', 'Phòng Vận hành', 'vuthif@company.com', '0901234572', true),
('Đặng Văn G', 'Phòng Kỹ thuật', 'dangvang@company.com', '0901234573', true),
('Bùi Thị H', 'Phòng Kỹ thuật', 'buithih@company.com', '0901234574', true),
('Đỗ Văn I', 'Phòng Kỹ thuật', 'dovani@company.com', '0901234575', true),
('Ngô Thị K', 'Phòng Vận hành', 'ngothik@company.com', '0901234576', true),
('Lý Văn L', 'Phòng Kỹ thuật', 'lyvanl@company.com', '0901234577', true),
('Đinh Thị M', 'Phòng Vận hành', 'dinhthim@company.com', '0901234578', false);

-- Insert dữ liệu mẫu cho contact_roles (mapping)
-- Nguyễn Văn A - Lãnh đạo trung tâm
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (1, 1, true);

-- Trần Thị B - Lãnh đạo Phòng Vận hành + Team Leader
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES 
(2, 2, true),
(2, 4, false);

-- Lê Văn C - Lãnh đạo Phòng Kỹ thuật + Team Leader
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES 
(3, 3, true),
(3, 4, false);

-- Phạm Thị D - Team Leader + Bộ phận vận hành
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES 
(4, 4, true),
(4, 5, false);

-- Hoàng Văn E - Bộ phận vận hành
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (5, 5, true);

-- Vũ Thị F - Bộ phận vận hành
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (6, 5, true);

-- Đặng Văn G - Team Leader + Bộ phận kỹ thuật
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES 
(7, 4, true),
(7, 6, false);

-- Bùi Thị H - Bộ phận kỹ thuật
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (8, 6, true);

-- Đỗ Văn I - Bộ phận kỹ thuật
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (9, 6, true);

-- Ngô Thị K - Bộ phận vận hành
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (10, 5, true);

-- Lý Văn L - Bộ phận kỹ thuật
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (11, 6, true);

-- Đinh Thị M - Bộ phận vận hành
INSERT INTO contact_roles (contact_id, role_id, is_primary) VALUES (12, 5, true);

-- Thêm comment cho các bảng
COMMENT ON TABLE contacts IS 'Bảng quản lý danh bạ nhân sự';
COMMENT ON COLUMN contacts.full_name IS 'Họ và tên';
COMMENT ON COLUMN contacts.unit IS 'Đơn vị công tác';
COMMENT ON COLUMN contacts.email IS 'Email liên hệ';
COMMENT ON COLUMN contacts.phone IS 'Số điện thoại';
COMMENT ON COLUMN contacts.is_active IS 'Trạng thái hoạt động';
COMMENT ON COLUMN contacts.notes IS 'Ghi chú thêm';

COMMENT ON TABLE roles IS 'Bảng vai trò';
COMMENT ON COLUMN roles.name IS 'Tên vai trò';
COMMENT ON COLUMN roles.description IS 'Mô tả vai trò';
COMMENT ON COLUMN roles.display_order IS 'Thứ tự hiển thị';
COMMENT ON COLUMN roles.is_active IS 'Trạng thái sử dụng';

COMMENT ON TABLE contact_roles IS 'Bảng mapping nhiều-nhiều giữa contact và role';
COMMENT ON COLUMN contact_roles.is_primary IS 'Đánh dấu vai trò chính';

-- View để xem thông tin contact kèm roles
CREATE OR REPLACE VIEW v_contacts_with_roles AS
SELECT 
    c.id,
    c.full_name,
    c.unit,
    c.email,
    c.phone,
    c.is_active,
    STRING_AGG(r.name, ', ' ORDER BY r.display_order) as roles,
    STRING_AGG(
        CASE WHEN cr.is_primary THEN r.name ELSE NULL END, 
        ', '
    ) as primary_role
FROM contacts c
LEFT JOIN contact_roles cr ON c.id = cr.contact_id
LEFT JOIN roles r ON cr.role_id = r.id
GROUP BY c.id, c.full_name, c.unit, c.email, c.phone, c.is_active;

-- Thống kê dữ liệu mẫu
SELECT 
    r.name as role_name,
    COUNT(DISTINCT cr.contact_id) as total_contacts,
    COUNT(DISTINCT CASE WHEN c.is_active THEN cr.contact_id END) as active_contacts
FROM roles r
LEFT JOIN contact_roles cr ON r.id = cr.role_id
LEFT JOIN contacts c ON cr.contact_id = c.id
GROUP BY r.id, r.name
ORDER BY r.display_order;

-- Hiển thị danh sách contacts với roles
SELECT * FROM v_contacts_with_roles ORDER BY id;