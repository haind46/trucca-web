-- =========================================
-- UPDATE TABLE: sys_severity (Simplified Version)
-- Mục đích: Loại bỏ các trường không cần thiết
-- Ngày cập nhật: 2025-11-25
-- =========================================

-- =========================================
-- OPTION 1: DROP & RECREATE (Khuyến nghị cho dev/test)
-- =========================================

-- Backup dữ liệu cũ (nếu cần)
-- CREATE TABLE sys_severity_backup AS SELECT * FROM sys_severity;

-- Drop table cũ
DROP TABLE IF EXISTS sys_severity CASCADE;

-- Tạo lại table mới với schema đơn giản
CREATE TABLE sys_severity (
    -- ========== PRIMARY KEY ==========
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

    -- ========== SEVERITY INFO ==========
    severity_code VARCHAR(20) NOT NULL UNIQUE,
    severity_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- ========== UI DISPLAY ==========
    color_code VARCHAR(7),
    icon_name VARCHAR(50),
    priority_level INTEGER NOT NULL DEFAULT 3,

    -- ========== CLEAR CONFIG ==========
    clear_cycle_count INTEGER DEFAULT 2,
    clear_timeout_minutes INTEGER DEFAULT 10,
    clear_notification_enabled BOOLEAN DEFAULT TRUE,

    -- ========== STATUS ==========
    is_active BOOLEAN DEFAULT TRUE,

    -- ========== METADATA ==========
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    -- ========== CONSTRAINTS ==========
    CONSTRAINT chk_priority_level CHECK (priority_level BETWEEN 1 AND 5)
);

-- ========== INDEXES ==========
CREATE INDEX idx_sys_severity_code ON sys_severity(severity_code);
CREATE INDEX idx_sys_severity_active ON sys_severity(is_active);
CREATE INDEX idx_sys_severity_priority ON sys_severity(priority_level DESC);

-- ========== COMMENTS ==========
COMMENT ON TABLE sys_severity IS 'Bảng cấu hình mức độ cảnh báo (Simplified Version)';
COMMENT ON COLUMN sys_severity.severity_code IS 'Mã severity: DOWN, CRITICAL, MAJOR, MINOR (UNIQUE)';
COMMENT ON COLUMN sys_severity.clear_cycle_count IS 'Số chu kỳ liên tiếp bình thường để auto clear';
COMMENT ON COLUMN sys_severity.clear_timeout_minutes IS 'Thời gian (phút) không có vi phạm để auto clear';

-- =========================================
-- INSERT SAMPLE DATA (Simplified Version)
-- =========================================

INSERT INTO sys_severity (
    severity_code, severity_name, description,
    color_code, icon_name, priority_level,
    clear_cycle_count, clear_timeout_minutes, clear_notification_enabled,
    is_active
) VALUES
-- DOWN: Hệ thống ngừng hoạt động hoàn toàn
(
    'DOWN', 'Ngừng hoạt động',
    'Hệ thống, dịch vụ hoặc thiết bị ngừng hoạt động hoàn toàn. Cần xử lý NGAY LẬP TỨC.',
    '#DC2626', 'alert-octagon', 5,
    2, 5, TRUE,
    TRUE
),

-- CRITICAL: Nghiêm trọng
(
    'CRITICAL', 'Nghiêm trọng',
    'Sự cố nghiêm trọng ảnh hưởng đến hoạt động chính của hệ thống. Cần xử lý trong vòng 15 phút.',
    '#EF4444', 'alert-circle', 4,
    2, 10, TRUE,
    TRUE
),

-- MAJOR: Quan trọng
(
    'MAJOR', 'Quan trọng',
    'Sự cố quan trọng ảnh hưởng đến một phần chức năng hệ thống. Cần xử lý trong vòng 1 giờ.',
    '#F59E0B', 'alert-triangle', 3,
    3, 15, TRUE,
    TRUE
),

-- MINOR: Nhỏ
(
    'MINOR', 'Nhỏ',
    'Sự cố nhỏ, không ảnh hưởng nghiêm trọng đến hệ thống. Theo dõi và xử lý khi có thời gian.',
    '#FBBF24', 'info', 2,
    3, 30, FALSE,
    TRUE
),

-- WARNING: Cảnh báo
(
    'WARNING', 'Cảnh báo',
    'Cảnh báo về nguy cơ tiềm ẩn. Theo dõi để phòng ngừa sự cố.',
    '#A3E635', 'alert', 1,
    5, 60, FALSE,
    TRUE
)
ON CONFLICT (severity_code) DO NOTHING;

-- =========================================
-- OPTION 2: ALTER TABLE (Cho production - cẩn thận)
-- =========================================

/*
-- Chỉ dùng nếu muốn giữ data cũ và chuyển đổi dần

-- Xóa các constraints cũ (nếu có)
ALTER TABLE sys_severity DROP CONSTRAINT IF EXISTS chk_notify_to_level;
ALTER TABLE sys_severity DROP CONSTRAINT IF EXISTS chk_clear_strategy;

-- Xóa các columns không cần
ALTER TABLE sys_severity DROP COLUMN IF EXISTS display_order;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS notify_to_level;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS auto_call;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS tts_template;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS clear_strategy;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS auto_clear_enabled;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS clear_tts_template;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS repeat_count;
ALTER TABLE sys_severity DROP COLUMN IF EXISTS interval_minutes;

-- Cập nhật default values cho các columns còn lại
ALTER TABLE sys_severity ALTER COLUMN clear_cycle_count SET DEFAULT 2;
ALTER TABLE sys_severity ALTER COLUMN clear_timeout_minutes SET DEFAULT 10;
ALTER TABLE sys_severity ALTER COLUMN clear_notification_enabled SET DEFAULT TRUE;

-- Rebuild indexes (nếu cần)
DROP INDEX IF EXISTS idx_sys_severity_order;
CREATE INDEX IF NOT EXISTS idx_sys_severity_priority ON sys_severity(priority_level DESC);
*/

-- =========================================
-- VERIFICATION
-- =========================================

-- Kiểm tra schema mới
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sys_severity'
ORDER BY ordinal_position;

-- Kiểm tra dữ liệu
SELECT
    severity_code,
    severity_name,
    priority_level,
    clear_cycle_count,
    clear_timeout_minutes,
    is_active
FROM sys_severity
ORDER BY priority_level DESC;

-- =========================================
-- SUMMARY
-- =========================================

/*
REMOVED FIELDS:
  ✗ display_order
  ✗ notify_to_level
  ✗ auto_call
  ✗ tts_template
  ✗ clear_strategy
  ✗ auto_clear_enabled
  ✗ clear_tts_template
  ✗ repeat_count
  ✗ interval_minutes

REMAINING FIELDS (10 fields):
  ✓ severity_code (VARCHAR 20, UNIQUE)
  ✓ severity_name (VARCHAR 100)
  ✓ description (TEXT)
  ✓ color_code (VARCHAR 7)
  ✓ icon_name (VARCHAR 50)
  ✓ priority_level (INTEGER 1-5)
  ✓ clear_cycle_count (INTEGER)
  ✓ clear_timeout_minutes (INTEGER)
  ✓ clear_notification_enabled (BOOLEAN)
  ✓ is_active (BOOLEAN)
  + Metadata: created_at, updated_at, created_by, updated_by

SIMPLIFIED LOGIC:
  - Không có clear_strategy → Service tự quyết định dựa vào clear_cycle_count và clear_timeout_minutes
  - Không có notify_to_level → Service sẽ xử lý notification logic riêng
  - Không có alert frequency config → Service quản lý riêng
*/

-- =========================================
-- END OF SCRIPT
-- =========================================
