-- Xóa bảng nếu đã tồn tại
DROP TABLE IF EXISTS system_levels CASCADE;

-- Bảng system_levels (cấp độ hệ thống)
CREATE TABLE system_levels (
    id SERIAL PRIMARY KEY,
    level_code INTEGER NOT NULL UNIQUE,
    description TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_level_code CHECK (level_code > 0)
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_system_levels_code ON system_levels(level_code);
CREATE INDEX idx_system_levels_status ON system_levels(status);

-- Insert dữ liệu mẫu
INSERT INTO system_levels (level_code, description, status) VALUES
(1, 'Cấp độ 1 - Sự cố nghiêm trọng: Ảnh hưởng toàn bộ hệ thống, cần xử lý khẩn cấp ngay lập tức', true),
(2, 'Cấp độ 2 - Sự cố quan trọng: Ảnh hưởng một phần hệ thống, cần xử lý trong thời gian sớm nhất', true),
(3, 'Cấp độ 3 - Sự cố thông thường: Ảnh hưởng nhỏ, có thể xử lý trong thời gian bình thường', true);

-- Thêm comment cho bảng
COMMENT ON TABLE system_levels IS 'Bảng quản lý cấp độ hệ thống';
COMMENT ON COLUMN system_levels.level_code IS 'Mã cấp độ (1, 2, 3,...)';
COMMENT ON COLUMN system_levels.description IS 'Thông tin mô tả cấp độ';
COMMENT ON COLUMN system_levels.status IS 'Trạng thái';
COMMENT ON COLUMN system_levels.created_at IS 'Thời gian tạo';
COMMENT ON COLUMN system_levels.updated_at IS 'Thời gian cập nhật';

-- Hiển thị dữ liệu đã insert
SELECT 
    id,
    level_code,
    description,
    status,
    created_at
FROM system_levels
ORDER BY level_code;