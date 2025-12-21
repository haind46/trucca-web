# API Từ điển mã lỗi (Error Dictionary)

Base URL: `http://localhost:8002`

## Mục lục
1. [Lấy danh sách Error Dictionary](#1-lấy-danh-sách-error-dictionary)
2. [Lấy Error Dictionary theo ID](#2-lấy-error-dictionary-theo-id)
3. [Lấy Error Dictionary theo Error Code](#3-lấy-error-dictionary-theo-error-code)
4. [Lọc Error Dictionary](#4-lọc-error-dictionary)
5. [Tìm kiếm Error Dictionary](#5-tìm-kiếm-error-dictionary)
6. [Lấy theo Severity](#6-lấy-theo-severity)
7. [Lấy theo Status](#7-lấy-theo-status)
8. [Tạo mới Error Dictionary](#8-tạo-mới-error-dictionary)
9. [Cập nhật Error Dictionary](#9-cập-nhật-error-dictionary)
10. [Xóa Error Dictionary](#10-xóa-error-dictionary)
11. [Xóa nhiều Error Dictionary](#11-xóa-nhiều-error-dictionary)
12. [Sao chép Error Dictionary](#12-sao-chép-error-dictionary)
13. [Xuất Excel](#13-xuất-excel)
14. [Nhập từ Excel](#14-nhập-từ-excel)
15. [Tải Template Excel](#15-tải-template-excel)

---

## 1. Lấy danh sách Error Dictionary

**Endpoint:** `GET /api/error-dictionary`

**Mô tả:** Lấy danh sách từ điển mã lỗi có phân trang và tìm kiếm

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số items trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong error_code, error_info, error_detail, resource, type, alarm, solution_suggest) |
| sort_dir | String | Không | desc | Hướng sắp xếp: `asc` hoặc `desc` |
| sort_key | String | Không | id | Trường sắp xếp: `id`, `errorCode`, `severity`, etc. |

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary?page=1&limit=10&keyword=database&sort_dir=desc&sort_key=id
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "errorCode": "ERR-001",
        "errorInfo": "Database connection failed",
        "errorDetail": "Unable to connect to database server at 10.0.0.1:5432",
        "severity": "HIGH",
        "ancestry": "System.Database.Connection",
        "resource": "PostgreSQL Database",
        "resourceId": "db-prod-001",
        "resourceDescription": "Production database server",
        "type": "CONNECTION_ERROR",
        "alarm": "DB_CONNECTION_ALARM",
        "alarmDate": "2025-01-15T10:30:00Z",
        "conditionLog": "Connection timeout > 30s",
        "patternConditionLog": ".*timeout.*",
        "patternResource": ".*database.*",
        "status": 1,
        "solutionSuggest": "Check network connectivity and database server status"
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

---

## 2. Lấy Error Dictionary theo ID

**Endpoint:** `GET /api/error-dictionary/{id}`

**Mô tả:** Lấy thông tin chi tiết của một error dictionary theo ID

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Integer | Có | ID của error dictionary |

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/1
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "errorCode": "ERR-001",
    "errorInfo": "Database connection failed",
    "errorDetail": "Unable to connect to database server at 10.0.0.1:5432",
    "severity": "HIGH",
    "ancestry": "System.Database.Connection",
    "resource": "PostgreSQL Database",
    "resourceId": "db-prod-001",
    "resourceDescription": "Production database server",
    "type": "CONNECTION_ERROR",
    "alarm": "DB_CONNECTION_ALARM",
    "alarmDate": "2025-01-15T10:30:00Z",
    "conditionLog": "Connection timeout > 30s",
    "patternConditionLog": ".*timeout.*",
    "patternResource": ".*database.*",
    "status": 1,
    "solutionSuggest": "Check network connectivity and database server status"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Error Dictionary not found with id: 999",
  "data": null
}
```

---

## 3. Lấy Error Dictionary theo Error Code

**Endpoint:** `GET /api/error-dictionary/code/{errorCode}`

**Mô tả:** Lấy thông tin error dictionary theo error code

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| errorCode | String | Có | Mã lỗi |

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/code/ERR-001
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "errorCode": "ERR-001",
    "errorInfo": "Database connection failed",
    "errorDetail": "Unable to connect to database server",
    "severity": "HIGH",
    "status": 1,
    "solutionSuggest": "Check network connectivity"
  }
}
```

---

## 4. Lọc Error Dictionary

**Endpoint:** `GET /api/error-dictionary/filter`

**Mô tả:** Lọc error dictionary với nhiều điều kiện

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số items/trang |
| errorCode | String | Không | - | Lọc theo error code (tìm kiếm tương đối) |
| errorInfo | String | Không | - | Lọc theo error info (tìm kiếm tương đối) |
| severity | String | Không | - | Lọc theo severity (chính xác) |
| resource | String | Không | - | Lọc theo resource (tìm kiếm tương đối) |
| type | String | Không | - | Lọc theo type (chính xác) |
| status | Integer | Không | - | Lọc theo status |
| sort_dir | String | Không | desc | Hướng sắp xếp |
| sort_key | String | Không | id | Trường sắp xếp |

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/filter?severity=HIGH&status=1&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "content": [...],
    "totalElements": 20,
    "totalPages": 2,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

---

## 5. Tìm kiếm Error Dictionary

**Endpoint:** `GET /api/error-dictionary/search`

**Mô tả:** Tìm kiếm nâng cao với lọc database trước khi phân trang

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số items/trang |
| errorCode | String | Không | - | Tìm kiếm error code (tương đối) |
| errorInfo | String | Không | - | Tìm kiếm error info (tương đối) |
| severity | String | Không | - | Tìm kiếm severity (chính xác) |
| resource | String | Không | - | Tìm kiếm resource (tương đối) |
| sort_dir | String | Không | desc | Hướng sắp xếp |
| sort_key | String | Không | id | Trường sắp xếp |

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/search?errorCode=ERR&severity=HIGH
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "currentPage": 1,
    "totalItems": 15,
    "totalPages": 2,
    "items": [...]
  }
}
```

---

## 6. Lấy theo Severity

**Endpoint:** `GET /api/error-dictionary/severity/{severity}`

**Mô tả:** Lấy tất cả error dictionaries theo mức độ nghiêm trọng

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| severity | String | Có | Mức độ nghiêm trọng (HIGH, MEDIUM, LOW) |

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/severity/HIGH
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "errorCode": "ERR-001",
      "severity": "HIGH",
      ...
    }
  ]
}
```

---

## 7. Lấy theo Status

**Endpoint:** `GET /api/error-dictionary/status/{status}`

**Mô tả:** Lấy tất cả error dictionaries theo trạng thái

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| status | Integer | Có | Trạng thái (0=inactive, 1=active) |

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/status/1
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "status": 1,
      ...
    }
  ]
}
```

---

## 8. Tạo mới Error Dictionary

**Endpoint:** `POST /api/error-dictionary/create`

**Mô tả:** Tạo mới một error dictionary entry

**Request Body:**
```json
{
  "errorCode": "ERR-002",
  "errorInfo": "Application crash",
  "errorDetail": "Application terminated unexpectedly",
  "severity": "CRITICAL",
  "ancestry": "System.Application.Runtime",
  "resource": "Application Server",
  "resourceId": "app-prod-001",
  "resourceDescription": "Production application server",
  "type": "RUNTIME_ERROR",
  "alarm": "APP_CRASH_ALARM",
  "alarmDate": "2025-01-15T12:00:00.000Z",
  "conditionLog": "Exit code != 0",
  "patternConditionLog": ".*exit.*",
  "patternResource": ".*application.*",
  "status": 1,
  "solutionSuggest": "Check application logs and restart service"
}
```

**Request Body Fields:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| errorCode | String | Không | Mã lỗi (max 50 ký tự) |
| errorInfo | String | Không | Thông tin lỗi |
| errorDetail | String | Không | Chi tiết lỗi |
| severity | String | Không | Mức độ nghiêm trọng (max 50 ký tự) |
| ancestry | String | Không | Phân cấp lỗi |
| resource | String | Không | Tài nguyên (max 255 ký tự) |
| resourceId | String | Không | ID tài nguyên (max 100 ký tự) |
| resourceDescription | String | Không | Mô tả tài nguyên |
| type | String | Không | Loại lỗi (max 100 ký tự) |
| alarm | String | Không | Tên alarm (max 100 ký tự) |
| alarmDate | Instant | Không | Ngày alarm (ISO 8601) |
| conditionLog | String | Không | Điều kiện log |
| patternConditionLog | String | Không | Pattern cho condition log |
| patternResource | String | Không | Pattern cho resource |
| status | Integer | Không | Trạng thái (default: 1) |
| solutionSuggest | String | Không | Giải pháp đề xuất |

**Response Success (201 Created):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Error dictionary created successfully",
  "data": {
    "id": 2,
    "errorCode": "ERR-002",
    "errorInfo": "Application crash",
    "status": 1,
    ...
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error code already exists: ERR-002",
  "data": null
}
```

---

## 9. Cập nhật Error Dictionary

**Endpoint:** `POST /api/error-dictionary/edit`

**Mô tả:** Cập nhật thông tin error dictionary

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Integer | Có | ID của error dictionary cần cập nhật |

**Request Body:**
```json
{
  "errorInfo": "Application crash (updated)",
  "severity": "HIGH",
  "solutionSuggest": "Check application logs, restart service, and monitor"
}
```

**Request Example:**
```http
POST http://localhost:8002/api/error-dictionary/edit?id=2
Content-Type: application/json

{
  "errorInfo": "Application crash (updated)",
  "severity": "HIGH"
}
```

**Lưu ý:**
- Chỉ cần gửi các field cần cập nhật
- Các field không gửi sẽ giữ nguyên giá trị cũ

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Error dictionary updated successfully",
  "data": {
    "id": 2,
    "errorCode": "ERR-002",
    "errorInfo": "Application crash (updated)",
    "severity": "HIGH",
    ...
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Error Dictionary not found with id: 999",
  "data": null
}
```

---

## 10. Xóa Error Dictionary

**Endpoint:** `DELETE /api/error-dictionary/delete/{id}`

**Mô tả:** Xóa một error dictionary theo ID

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Integer | Có | ID của error dictionary cần xóa |

**Request Example:**
```http
DELETE http://localhost:8002/api/error-dictionary/delete/2
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Error dictionary deleted successfully",
  "data": null
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Error Dictionary not found with id: 2",
  "data": null
}
```

---

## 11. Xóa nhiều Error Dictionary

**Endpoint:** `DELETE /api/error-dictionary/delete`

**Mô tả:** Xóa nhiều error dictionaries cùng lúc

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| ids | Array[Integer] | Có | Danh sách ID cần xóa |

**Request Example:**
```http
DELETE http://localhost:8002/api/error-dictionary/delete?ids=1&ids=2&ids=3
```

hoặc

```http
DELETE http://localhost:8002/api/error-dictionary/delete?ids=1,2,3
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Error dictionaries deleted successfully",
  "data": null
}
```

---

## 12. Sao chép Error Dictionary

**Endpoint:** `POST /api/error-dictionary/copy`

**Mô tả:** Sao chép một error dictionary

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Integer | Có | ID của error dictionary cần sao chép |

**Request Example:**
```http
POST http://localhost:8002/api/error-dictionary/copy?id=1
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Error dictionary copied successfully",
  "data": {
    "id": 10,
    "errorCode": "ERR-001_copy",
    "errorInfo": "Database connection failed",
    "errorDetail": "Unable to connect to database server",
    "severity": "HIGH",
    "status": 0,
    ...
  }
}
```

**Lưu ý:**
- Bản sao sẽ có errorCode = `{errorCode_gốc}_copy`
- Bản sao mặc định có `status = 0` (inactive)

---

## 13. Xuất Excel

**Endpoint:** `GET /api/error-dictionary/export`

**Mô tả:** Xuất toàn bộ danh sách error dictionaries ra file Excel

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/export
```

**Response:** File Excel (.xlsx) với tên `error_dictionary_export.xlsx`

**Cấu trúc file Excel:**

| ID | Mã lỗi | Thông tin lỗi | Chi tiết lỗi | Mức độ | Ancestry | Tài nguyên | Resource ID | Mô tả tài nguyên | Loại | Alarm | Ngày alarm | Condition Log | Pattern Condition | Pattern Resource | Trạng thái | Giải pháp |
|----|--------|---------------|--------------|--------|----------|------------|-------------|------------------|------|-------|------------|---------------|-------------------|------------------|------------|-----------|
| 1 | ERR-001 | Database... | Unable... | HIGH | System... | PostgreSQL | db-prod-001 | Production... | CONNECTION | DB_ALARM | 2025-01-15... | Connection... | .*timeout.* | .*database.* | 1 | Check... |

---

## 14. Nhập từ Excel

**Endpoint:** `POST /api/error-dictionary/import`

**Mô tả:** Nhập dữ liệu error dictionaries từ file Excel

**Content-Type:** `multipart/form-data`

**Form Data:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| file | File | Có | File Excel (.xlsx) |

**Request Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8002/api/error-dictionary/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Request Example (cURL):**
```bash
curl -X POST http://localhost:8002/api/error-dictionary/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@error_dictionary_import.xlsx"
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Imported 10 items",
  "data": [
    {
      "id": 11,
      "errorCode": "ERR-010",
      "errorInfo": "New error from import",
      ...
    }
  ]
}
```

**Response Error (500 Internal Server Error):**
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Import fail: Invalid file format",
  "data": null
}
```

**Lưu ý:**
- File Excel phải có đúng cấu trúc (17 cột như template)
- Các dòng thiếu `Mã lỗi` sẽ bị bỏ qua

---

## 15. Tải Template Excel

**Endpoint:** `GET /api/error-dictionary/template`

**Mô tả:** Tải file template Excel để import

**Request Example:**
```http
GET http://localhost:8002/api/error-dictionary/template
```

**Response:** File Excel (.xlsx) với tên `error_dictionary_template.xlsx`

**Nội dung template:**

| ID | Mã lỗi | Thông tin lỗi | Chi tiết lỗi | Mức độ | Ancestry | Tài nguyên | Resource ID | Mô tả tài nguyên | Loại | Alarm | Ngày alarm | Condition Log | Pattern Condition | Pattern Resource | Trạng thái | Giải pháp |
|----|--------|---------------|--------------|--------|----------|------------|-------------|------------------|------|-------|------------|---------------|-------------------|------------------|------------|-----------|
| | ERR-001 | Database connection failed | Unable to connect to database server | HIGH | System.Database.Connection | PostgreSQL Database | db-prod-001 | Production database server | CONNECTION_ERROR | DB_CONNECTION_ALARM | | Connection timeout > 30s | .*timeout.* | .*database.* | 1 | Check network connectivity and database server status |

---

## Cấu trúc Response chung

### Response thành công
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { /* Dữ liệu trả về */ }
}
```

### Response lỗi
```json
{
  "success": false,
  "statusCode": 400/404/500,
  "message": "Error message",
  "data": null
}
```

## HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| 200 | Success - Yêu cầu thành công |
| 201 | Created - Tạo mới thành công |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 404 | Not Found - Không tìm thấy resource |
| 500 | Internal Server Error - Lỗi server |

## Lưu ý quan trọng

1. **Authentication:** Tất cả API cần có token xác thực (nếu có middleware auth)
2. **Content-Type:** Sử dụng `application/json` cho các API POST/PUT/DELETE (trừ import)
3. **Encoding:** UTF-8
4. **Date Format:** ISO 8601 (YYYY-MM-DDTHH:mm:ss.SSSZ)
5. **Validation:**
   - `errorCode` max 50 ký tự
   - `severity` max 50 ký tự
   - `resource` max 255 ký tự
   - `resourceId` max 100 ký tự
   - `type` max 100 ký tự
   - `alarm` max 100 ký tự
   - `status` default = 1
6. **Tìm kiếm:**
   - `/api/error-dictionary` - Tìm kiếm đơn giản với keyword
   - `/api/error-dictionary/filter` - Lọc với nhiều điều kiện
   - `/api/error-dictionary/search` - Tìm kiếm nâng cao (database-level filtering)

---

**Ngày tạo:** 2025-01-26
**Phiên bản:** 1.0
**Base URL:** http://localhost:8002
