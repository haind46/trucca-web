# FIX LỖI 403 FORBIDDEN CHO LOG ENTRIES API

## Vấn đề

Khi frontend gọi API `/api/log-entries/filter`, backend trả về lỗi 403 Forbidden:

```
{
    "timestamp": 1764292341425,
    "status": 403,
    "error": "Forbidden",
    "path": "/api/log-entries/filter"
}
```

Backend log:
```
2025-11-28 08:12:21.424 DEBUG 55180 --- [nio-8002-exec-7] o.s.s.w.a.i.FilterSecurityInterceptor    : Failed to authorize filter invocation [GET /api/log-entries/filter?page=1&limit=20&sort_dir=desc&sort_key=occurred_at] with attributes [authenticated]
2025-11-28 08:12:21.424 DEBUG 55180 --- [nio-8002-exec-7] o.s.s.w.a.Http403ForbiddenEntryPoint     : Pre-authenticated entry point called. Rejecting access
```

## Nguyên nhân

Backend đang yêu cầu permission `authenticated` cho endpoint nhưng:
1. User chưa được cấp quyền truy cập resource `log-entries`
2. Hoặc Security Configuration chưa permit endpoint này

## Giải pháp

### Option 1: Cấp quyền cho User/Role

Đảm bảo user hiện tại có quyền truy cập resource `log-entries`:

1. Vào menu **Quản trị hệ thống > Phân quyền**
2. Chọn Role của user (ví dụ: ADMIN, USER, v.v.)
3. Thêm permission cho resource `LOG_ENTRIES` với các actions:
   - `LIST` - Xem danh sách log
   - `FILTER` - Tìm kiếm/lọc log
   - `EXPORT` - Xuất báo cáo Excel

### Option 2: Cập nhật Security Configuration (Backend)

Nếu endpoint này cần public hoặc chỉ cần authenticated (không cần specific permission), cần update SecurityConfig:

**File: `server/src/main/java/com/example/config/SecurityConfig.java`** (hoặc tương tự)

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .authorizeRequests()
            // Cho phép tất cả authenticated users truy cập log-entries
            .antMatchers("/api/log-entries/**").authenticated()
            // Hoặc nếu muốn public:
            // .antMatchers("/api/log-entries/**").permitAll()

            // Các endpoints khác...
            .anyRequest().authenticated()
        .and()
        // ... other configs
}
```

### Option 3: Thêm Resource vào Database (Nếu chưa có)

**KHUYẾN NGHỊ: Sử dụng script SQL có sẵn**

Chạy script SQL này để tự động thêm resource và cấp quyền:

```bash
# Kết nối MySQL và chạy script
mysql -u username -p database_name < docs/fix_log_entries_permission.sql
```

Hoặc copy nội dung từ file [docs/fix_log_entries_permission.sql](fix_log_entries_permission.sql) và chạy trong MySQL Workbench/phpMyAdmin.

**Hoặc chạy thủ công:**

Kiểm tra xem resource `LOG_ENTRIES` đã tồn tại trong database chưa:

```sql
-- 1. Thêm resource nếu chưa có
INSERT INTO resources (code, name, description, status, created_at, updated_at)
SELECT 'LOG_ENTRIES', 'Tra cứu Log hệ thống', 'Quản lý và tra cứu log entries từ các hệ thống giám sát', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE code = 'LOG_ENTRIES');

-- 2. Lấy ID của resource
SET @log_entries_resource_id = (SELECT id FROM resources WHERE code = 'LOG_ENTRIES' LIMIT 1);

-- 3. Cấp quyền READ cho role ADMIN (giả sử ADMIN có id = 1)
INSERT INTO role_permissions (role_id, resource_id, can_read, can_create, can_update, can_delete, created_at, updated_at)
SELECT 1, @log_entries_resource_id, 1, 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = 1 AND resource_id = @log_entries_resource_id);

-- 4. Kiểm tra kết quả
SELECT r.name AS role_name, res.code AS resource_code, rp.can_read
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN resources res ON rp.resource_id = res.id
WHERE res.code = 'LOG_ENTRIES';
```

## Kiểm tra Authentication Token

Đảm bảo frontend đang gửi token đúng cách:

1. Mở Developer Tools (F12) → Network tab
2. Click vào request `/api/log-entries/filter`
3. Kiểm tra **Request Headers**:
   ```
   Authorization: Bearer <access_token>
   ```
4. Nếu không có header này, kiểm tra localStorage:
   ```javascript
   localStorage.getItem('trucca_access_token')
   ```

## Test Lại

Sau khi fix permission, test lại:

```bash
# Test với curl (thay YOUR_TOKEN bằng access token thật)
curl -X GET \
  'http://localhost:8002/api/log-entries/filter?page=1&limit=20&sort_dir=desc&sort_key=occurred_at' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Kết quả mong đợi: HTTP 200 OK với dữ liệu log entries

## Checklist Fix

- [ ] Kiểm tra resource `LOG_ENTRIES` đã tồn tại trong database
- [ ] Kiểm tra role hiện tại có permission cho `LOG_ENTRIES`
- [ ] Kiểm tra SecurityConfig có permit endpoint `/api/log-entries/**`
- [ ] Kiểm tra frontend gửi đúng Authorization header
- [ ] Test lại API với curl hoặc Postman
- [ ] Test lại trên giao diện web

## Lưu ý

Theo tài liệu `LOG_ENTRIES_API.md`, các endpoint log entries chỉ hỗ trợ **READ-ONLY** operations:
- `GET /api/log-entries` - List all
- `GET /api/log-entries/filter` - Advanced filter
- `GET /api/log-entries/export` - Export Excel
- `POST /api/log-entries` - Chỉ dành cho monitoring systems, **không dành cho users**

Do đó, permission cho user chỉ cần **READ** là đủ.
