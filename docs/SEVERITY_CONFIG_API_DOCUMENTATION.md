# API Documentation - Quản lý Mức độ Cảnh báo (Severity Config)

## Tổng quan
Module này cung cấp các API để quản lý cấu hình mức độ cảnh báo trong hệ thống.

**Base URL:** `http://localhost:8002`

---

## 1. List All - Lấy danh sách tất cả

### Endpoint
```
GET /api/severity-config
```

### Mô tả
Lấy danh sách tất cả các cấu hình mức độ cảnh báo với phân trang và tìm kiếm.

### Request Parameters

| Tham số | Type | Required | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | No | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | No | 10 | Số bản ghi trên mỗi trang |
| keyword | String | No | - | Từ khóa tìm kiếm (tìm trong severity_level và description) |
| sortDir | String | No | desc | Hướng sắp xếp: asc hoặc desc |
| sortKey | String | No | createdAt | Trường để sắp xếp |

### Request Example
```http
GET http://localhost:8002/api/severity-config?page=1&limit=10&keyword=HIGH
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "severityLevel": "HIGH",
        "description": "Cảnh báo mức độ cao",
        "notifyToLevel": 3,
        "autoCall": true,
        "ttsTemplate": "Cảnh báo mức độ cao: {description}",
        "createdAt": "2025-11-23T10:30:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "severityLevel": "MEDIUM",
        "description": "Cảnh báo mức độ trung bình",
        "notifyToLevel": 2,
        "autoCall": false,
        "ttsTemplate": "Cảnh báo mức độ trung bình: {description}",
        "createdAt": "2025-11-23T10:25:00.000Z"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

---

## 2. Filter - Tìm kiếm

### Endpoint
```
POST /api/severity-config/filter
```

### Mô tả
Tìm kiếm các cấu hình mức độ cảnh báo theo từ khóa.

### Request Parameters

| Tham số | Type | Required | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | No | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | No | 10 | Số bản ghi trên mỗi trang |
| keyword | String | No | - | Từ khóa tìm kiếm |
| sortDir | String | No | desc | Hướng sắp xếp: asc hoặc desc |
| sortKey | String | No | createdAt | Trường để sắp xếp |

### Request Example
```http
POST http://localhost:8002/api/severity-config/filter?page=1&limit=10&keyword=cao
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "severityLevel": "HIGH",
        "description": "Cảnh báo mức độ cao",
        "notifyToLevel": 3,
        "autoCall": true,
        "ttsTemplate": "Cảnh báo mức độ cao: {description}",
        "createdAt": "2025-11-23T10:30:00.000Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

---

## 3. Create - Thêm mới

### Endpoint
```
POST /api/severity-config/create
```

### Mô tả
Tạo mới một cấu hình mức độ cảnh báo.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "severityLevel": "CRITICAL",
  "description": "Cảnh báo khẩn cấp",
  "notifyToLevel": 5,
  "autoCall": true,
  "ttsTemplate": "Cảnh báo khẩn cấp: {description}. Vui lòng xử lý ngay."
}
```

### Request Body Parameters

| Tham số | Type | Required | Mô tả |
|---------|------|----------|-------|
| severityLevel | String | Yes | Mức độ cảnh báo (tối đa 20 ký tự) |
| description | String | No | Mô tả chi tiết |
| notifyToLevel | Integer | No | Thông báo đến cấp |
| autoCall | Boolean | No | Tự động gọi điện (true/false) |
| ttsTemplate | String | No | Mẫu văn bản chuyển giọng nói |

### Request Example
```http
POST http://localhost:8002/api/severity-config/create
Content-Type: application/json

{
  "severityLevel": "CRITICAL",
  "description": "Cảnh báo khẩn cấp",
  "notifyToLevel": 5,
  "autoCall": true,
  "ttsTemplate": "Cảnh báo khẩn cấp: {description}. Vui lòng xử lý ngay."
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "severityLevel": "CRITICAL",
    "description": "Cảnh báo khẩn cấp",
    "notifyToLevel": 5,
    "autoCall": true,
    "ttsTemplate": "Cảnh báo khẩn cấp: {description}. Vui lòng xử lý ngay.",
    "createdAt": "2025-11-23T11:00:00.000Z"
  }
}
```

### Response Error (400 Bad Request)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid configuration data",
  "data": null
}
```

---

## 4. Edit - Sửa đối tượng

### Endpoint
```
POST /api/severity-config/edit?id={id}
```

### Mô tả
Cập nhật thông tin cấu hình mức độ cảnh báo.

### Request Parameters

| Tham số | Type | Required | Mô tả |
|---------|------|----------|-------|
| id | String | Yes | ID của cấu hình cần sửa |

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "description": "Cảnh báo khẩn cấp - Đã cập nhật",
  "notifyToLevel": 6,
  "autoCall": true
}
```

### Request Example
```http
POST http://localhost:8002/api/severity-config/edit?id=550e8400-e29b-41d4-a716-446655440005
Content-Type: application/json

{
  "description": "Cảnh báo khẩn cấp - Đã cập nhật",
  "notifyToLevel": 6
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "severityLevel": "CRITICAL",
    "description": "Cảnh báo khẩn cấp - Đã cập nhật",
    "notifyToLevel": 6,
    "autoCall": true,
    "ttsTemplate": "Cảnh báo khẩn cấp: {description}. Vui lòng xử lý ngay.",
    "createdAt": "2025-11-23T11:00:00.000Z"
  }
}
```

### Response Error (404 Not Found)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SeverityConfig not found",
  "data": null
}
```

---

## 5. Delete - Xóa đối tượng

### Endpoint
```
POST /api/severity-config/delete?ids={ids}
```

### Mô tả
Xóa một hoặc nhiều cấu hình mức độ cảnh báo.

### Request Parameters

| Tham số | Type | Required | Mô tả |
|---------|------|----------|-------|
| ids | String[] | Yes | Danh sách ID cần xóa (có thể 1 hoặc nhiều) |

### Request Example - Xóa 1 đối tượng
```http
POST http://localhost:8002/api/severity-config/delete?ids=550e8400-e29b-41d4-a716-446655440005
```

### Request Example - Xóa nhiều đối tượng
```http
POST http://localhost:8002/api/severity-config/delete?ids=550e8400-e29b-41d4-a716-446655440005&ids=550e8400-e29b-41d4-a716-446655440006
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": null
}
```

### Response Error (404 Not Found)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SeverityConfig with ID 550e8400-e29b-41d4-a716-446655440005 not found",
  "data": null
}
```

---

## 6. Copy - Sao chép đối tượng

### Endpoint
```
POST /api/severity-config/copy?id={id}
```

### Mô tả
Tạo bản sao của một cấu hình mức độ cảnh báo.

### Request Parameters

| Tham số | Type | Required | Mô tả |
|---------|------|----------|-------|
| id | String | Yes | ID của cấu hình cần sao chép |

### Request Example
```http
POST http://localhost:8002/api/severity-config/copy?id=550e8400-e29b-41d4-a716-446655440000
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Severity configuration copied successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "severityLevel": "HIGH_copy",
    "description": "Cảnh báo mức độ cao",
    "notifyToLevel": 3,
    "autoCall": true,
    "ttsTemplate": "Cảnh báo mức độ cao: {description}",
    "createdAt": "2025-11-23T11:15:00.000Z"
  }
}
```

### Response Error (404 Not Found)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SeverityConfig not found with id: 550e8400-e29b-41d4-a716-446655440000",
  "data": null
}
```

---

## 7. Export - Xuất dữ liệu

### Endpoint
```
GET /api/severity-config/export
```

### Mô tả
Xuất tất cả cấu hình mức độ cảnh báo ra file Excel.

### Request Example
```http
GET http://localhost:8002/api/severity-config/export
```

### Response Success (200 OK)
**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Content-Disposition:** `attachment; filename="severity_config_export.xlsx"`

Trả về file Excel có cấu trúc:

| ID | Mức độ cảnh báo | Mô tả | Thông báo đến cấp | Tự động gọi | Mẫu TTS |
|----|-----------------|-------|-------------------|-------------|---------|
| 550e8400-... | HIGH | Cảnh báo mức độ cao | 3 | Có | Cảnh báo... |
| 550e8400-... | MEDIUM | Cảnh báo trung bình | 2 | Không | Cảnh báo... |

---

## 8. Import - Nhập dữ liệu

### Endpoint
```
POST /api/severity-config/import
```

### Mô tả
Nhập dữ liệu cấu hình mức độ cảnh báo từ file Excel.

### Request Headers
```
Content-Type: multipart/form-data
```

### Request Body (Form Data)

| Tham số | Type | Required | Mô tả |
|---------|------|----------|-------|
| file | File | Yes | File Excel (.xlsx, .xls) cần import |

### Cấu trúc file Excel

File Excel cần có các cột theo thứ tự:

1. **ID** - Để trống khi import mới
2. **Mức độ cảnh báo** - Bắt buộc (tối đa 20 ký tự)
3. **Mô tả** - Tùy chọn
4. **Thông báo đến cấp** - Số nguyên
5. **Tự động gọi** - "Có", "Không", "true", "false", "1", "0"
6. **Mẫu TTS** - Tùy chọn

### Request Example
```http
POST http://localhost:8002/api/severity-config/import
Content-Type: multipart/form-data

file: [file Excel]
```

### Ví dụ code Frontend (JavaScript/React)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8002/api/severity-config/import', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Imported 3 severity configurations successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "severityLevel": "LOW",
      "description": "Cảnh báo mức độ thấp",
      "notifyToLevel": 1,
      "autoCall": false,
      "ttsTemplate": "Cảnh báo mức độ thấp",
      "createdAt": "2025-11-23T11:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440021",
      "severityLevel": "INFO",
      "description": "Thông tin",
      "notifyToLevel": 0,
      "autoCall": false,
      "ttsTemplate": "Thông tin: {description}",
      "createdAt": "2025-11-23T11:30:01.000Z"
    }
  ]
}
```

### Response Error (400 Bad Request)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid file format or data",
  "data": null
}
```

---

## 9. Download Template - Tải mẫu Excel

### Endpoint
```
GET /api/severity-config/template
```

### Mô tả
Tải file Excel mẫu để làm template cho việc import.

### Request Example
```http
GET http://localhost:8002/api/severity-config/template
```

### Response Success (200 OK)
**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Content-Disposition:** `attachment; filename="severity_config_template.xlsx"`

Trả về file Excel mẫu có 1 dòng dữ liệu mẫu:

| ID | Mức độ cảnh báo | Mô tả | Thông báo đến cấp | Tự động gọi | Mẫu TTS |
|----|-----------------|-------|-------------------|-------------|---------|
|    | HIGH | Cảnh báo mức độ cao | 3 | Có | Cảnh báo {severity_level}: {description} |

---

## Error Codes

| Status Code | Mô tả |
|-------------|-------|
| 200 | Success |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 404 | Not Found - Không tìm thấy đối tượng |
| 500 | Internal Server Error - Lỗi máy chủ |

---

## Lưu ý cho Frontend Developer

### 1. Tham số tìm kiếm
- **Luôn sử dụng `keyword`** (chữ thường), KHÔNG phải `keyWord`
- Tham số `keyword` tìm kiếm trong cả `severity_level` và `description`

### 2. Phân trang
- Trang bắt đầu từ **1** (không phải 0)
- Mặc định: page=1, limit=10

### 3. Sắp xếp
- `sortDir`: "asc" hoặc "desc"
- `sortKey`: Tên trường cần sắp xếp (mặc định: "createdAt")

### 4. Xóa đối tượng
- Có thể xóa 1 hoặc nhiều đối tượng cùng lúc bằng cách truyền nhiều giá trị `ids`
- Ví dụ: `?ids=id1&ids=id2&ids=id3`

### 5. Import/Export
- Export: Gọi GET, nhận về file Excel
- Import: Upload file qua FormData
- Có thể tải template mẫu từ endpoint `/template`

### 6. Response format
- Tất cả response đều có cấu trúc:
  ```json
  {
    "success": boolean,
    "statusCode": number,
    "message": string,
    "data": object | array | null
  }
  ```

### 7. Validation
- `severityLevel`: Bắt buộc, tối đa 20 ký tự
- `severityLevel` phải unique (không trùng)
- Các trường khác: Tùy chọn

---

## Testing với Postman/cURL

### Example: Create
```bash
curl -X POST "http://localhost:8002/api/severity-config/create" \
  -H "Content-Type: application/json" \
  -d '{
    "severityLevel": "WARNING",
    "description": "Cảnh báo",
    "notifyToLevel": 2,
    "autoCall": false,
    "ttsTemplate": "Cảnh báo: {description}"
  }'
```

### Example: Filter
```bash
curl -X POST "http://localhost:8002/api/severity-config/filter?keyword=cao&page=1&limit=10"
```

### Example: Export
```bash
curl -X GET "http://localhost:8002/api/severity-config/export" \
  --output severity_config.xlsx
```

---

**Version:** 1.0
**Last Updated:** 2025-11-23
**Contact:** Backend Team
