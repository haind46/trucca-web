# TRUCCA Backend API Documentation

## Base URL
```
http://localhost:8002
```

## Common Response Format

Tất cả các API đều trả về response theo format chung:

```json
{
  "success": true,
  "data": {},
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 1. Authentication APIs

### 1.1 Login
**Endpoint:** `POST /api/auth/login`

**Description:** Đăng nhập vào hệ thống

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 1.2 Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Đăng xuất khỏi hệ thống

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 1.3 Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Làm mới access token

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 2. Department APIs

### 2.1 Get All Departments
**Endpoint:** `GET /api/department`

**Description:** Lấy danh sách phòng ban có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyWord` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 2.2 Create Department
**Endpoint:** `POST /api/department/create`

**Description:** Tạo phòng ban mới

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 2.3 Edit Department
**Endpoint:** `POST /api/department/edit?id={id}`

**Description:** Cập nhật thông tin phòng ban

**Query Parameters:**
- `id` (required): ID của phòng ban

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 2.4 Delete Departments
**Endpoint:** `POST /api/department/delete?ids={ids}`

**Description:** Xóa một hoặc nhiều phòng ban

**Query Parameters:**
- `ids` (required): Danh sách ID phòng ban cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 3. Error Dictionary APIs

### 3.1 Get All Error Dictionaries
**Endpoint:** `GET /api/error-dictionary`

**Description:** Lấy danh sách từ điển lỗi có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyword` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 3.2 Get Error Dictionaries with Filters
**Endpoint:** `GET /api/error-dictionary/filter`

**Description:** Lấy danh sách từ điển lỗi với các bộ lọc

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `errorCode` (optional): Mã lỗi
- `errorInfo` (optional): Thông tin lỗi
- `severity` (optional): Mức độ nghiêm trọng
- `resource` (optional): Tài nguyên
- `type` (optional): Loại
- `status` (optional): Trạng thái
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 3.3 Search Error Dictionaries
**Endpoint:** `GET /api/error-dictionary/search`

**Description:** Tìm kiếm từ điển lỗi (query trực tiếp trước khi phân trang)

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `errorCode` (optional): Mã lỗi (tìm kiếm tương đối)
- `errorInfo` (optional): Thông tin lỗi (tìm kiếm tương đối)
- `severity` (optional): Mức độ nghiêm trọng (tìm kiếm chính xác)
- `resource` (optional): Tài nguyên (tìm kiếm tương đối)
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 3.4 Get Error Dictionary by ID
**Endpoint:** `GET /api/error-dictionary/{id}`

**Description:** Lấy thông tin từ điển lỗi theo ID

**Path Parameters:**
- `id` (required): ID của từ điển lỗi

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 0,
    "errorCode": "string",
    "errorInfo": "string",
    "errorDetail": "string",
    "severity": "string",
    "ancestry": "string",
    "resource": "string",
    "resourceId": "string",
    "resourceDescription": "string",
    "type": "string",
    "alarm": "string",
    "alarmDate": "2024-07-10T00:00:00.000Z",
    "conditionLog": "string",
    "patternConditionLog": "string",
    "patternResource": "string",
    "status": 1,
    "solutionSuggest": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 3.5 Get Error Dictionary by Error Code
**Endpoint:** `GET /api/error-dictionary/code/{errorCode}`

**Description:** Lấy thông tin từ điển lỗi theo mã lỗi

**Path Parameters:**
- `errorCode` (required): Mã lỗi

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 0,
    "errorCode": "string",
    "errorInfo": "string",
    "errorDetail": "string",
    "severity": "string",
    "resource": "string",
    "status": 1
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 3.6 Get Error Dictionaries by Severity
**Endpoint:** `GET /api/error-dictionary/severity/{severity}`

**Description:** Lấy danh sách từ điển lỗi theo mức độ nghiêm trọng

**Path Parameters:**
- `severity` (required): Mức độ nghiêm trọng

**Response:**
```json
{
  "success": true,
  "data": [],
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 3.7 Get Error Dictionaries by Status
**Endpoint:** `GET /api/error-dictionary/status/{status}`

**Description:** Lấy danh sách từ điển lỗi theo trạng thái

**Path Parameters:**
- `status` (required): Trạng thái (Integer)

**Response:**
```json
{
  "success": true,
  "data": [],
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 3.8 Create Error Dictionary
**Endpoint:** `POST /api/error-dictionary/create`

**Description:** Tạo từ điển lỗi mới

**Request Body:**
```json
{
  "errorCode": "string (max 50)",
  "errorInfo": "string",
  "errorDetail": "string",
  "severity": "string (max 50)",
  "ancestry": "string",
  "resource": "string (max 255)",
  "resourceId": "string (max 100)",
  "resourceDescription": "string",
  "type": "string (max 100)",
  "alarm": "string (max 100)",
  "alarmDate": "2024-07-10T00:00:00.000Z",
  "conditionLog": "string",
  "patternConditionLog": "string",
  "patternResource": "string",
  "status": 1,
  "solutionSuggest": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 0,
    "errorCode": "string",
    "errorInfo": "string",
    "errorDetail": "string",
    "severity": "string",
    "resource": "string",
    "status": 1
  },
  "message": "Error dictionary created successfully",
  "statusCode": 200
}
```

---

### 3.9 Update Error Dictionary
**Endpoint:** `PUT /api/error-dictionary/update/{id}`

**Description:** Cập nhật thông tin từ điển lỗi

**Path Parameters:**
- `id` (required): ID của từ điển lỗi

**Request Body:**
```json
{
  "errorCode": "string (max 50)",
  "errorInfo": "string",
  "errorDetail": "string",
  "severity": "string (max 50)",
  "ancestry": "string",
  "resource": "string (max 255)",
  "resourceId": "string (max 100)",
  "resourceDescription": "string",
  "type": "string (max 100)",
  "alarm": "string (max 100)",
  "alarmDate": "2024-07-10T00:00:00.000Z",
  "conditionLog": "string",
  "patternConditionLog": "string",
  "patternResource": "string",
  "status": 1,
  "solutionSuggest": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 0,
    "errorCode": "string",
    "errorInfo": "string"
  },
  "message": "Error dictionary updated successfully",
  "statusCode": 200
}
```

---

### 3.10 Delete Error Dictionary
**Endpoint:** `DELETE /api/error-dictionary/delete/{id}`

**Description:** Xóa một từ điển lỗi

**Path Parameters:**
- `id` (required): ID của từ điển lỗi

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Error dictionary deleted successfully",
  "statusCode": 200
}
```

---

### 3.11 Delete Multiple Error Dictionaries
**Endpoint:** `DELETE /api/error-dictionary/delete?ids={ids}`

**Description:** Xóa nhiều từ điển lỗi

**Query Parameters:**
- `ids` (required): Danh sách ID từ điển lỗi cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Error dictionaries deleted successfully",
  "statusCode": 200
}
```

---

## 4. Incident APIs

### 4.1 Get All Incidents
**Endpoint:** `GET /api/incident`

**Description:** Lấy danh sách sự cố có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyword` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "incident_time"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 4.2 Create Incident
**Endpoint:** `POST /api/incident/create`

**Description:** Tạo sự cố mới

**Request Body:**
```json
{
  "incidentTime": "2024-07-10T00:00:00.000Z",
  "systemName": "string",
  "description": "string",
  "severity": "string",
  "status": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "incidentTime": "2024-07-10T00:00:00.000Z",
    "systemName": "string",
    "description": "string",
    "severity": "string",
    "status": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 4.3 Edit Incident
**Endpoint:** `POST /api/incident/edit?id={id}`

**Description:** Cập nhật thông tin sự cố

**Query Parameters:**
- `id` (required): ID của sự cố

**Request Body:**
```json
{
  "incidentTime": "2024-07-10T00:00:00.000Z",
  "systemName": "string",
  "description": "string",
  "severity": "string",
  "status": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "incidentTime": "2024-07-10T00:00:00.000Z",
    "systemName": "string",
    "description": "string",
    "severity": "string",
    "status": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 4.4 Delete Incidents
**Endpoint:** `POST /api/incident/delete?ids={ids}`

**Description:** Xóa một hoặc nhiều sự cố

**Query Parameters:**
- `ids` (required): Danh sách ID sự cố cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 5. Log Event APIs

### 5.1 Process Log Event
**Endpoint:** `POST /api/event`

**Description:** Xử lý log event từ hệ thống

**Request Body:**
```json
{
  "key1": "value1",
  "key2": "value2"
}
```
*Note: Request body nhận Map<String, Object> - có thể chứa bất kỳ trường nào*

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 6. Log Entry APIs

### 6.1 Receive Log Entry
**Endpoint:** `POST /api/log`

**Description:** Nhận và lưu log entry từ hệ thống

**Request Body:**
```json
{
  "timestamp": "2024-07-10T00:00:00.000Z",
  "level": "string",
  "message": "string",
  "source": "string"
}
```

**Response:**
```json
{
  "id": 0,
  "timestamp": "2024-07-10T00:00:00.000Z",
  "level": "string",
  "message": "string",
  "source": "string"
}
```

---

### 6.2 Get Log Entries with Filter
**Endpoint:** `POST /api/log/filter`

**Description:** Lấy danh sách log entry có phân trang và lọc

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyWord` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Request Body:**
```json
{
  "level": "string",
  "source": "string",
  "fromDate": "2024-07-10T00:00:00.000Z",
  "toDate": "2024-07-10T23:59:59.999Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 7. Alert Report APIs

### 7.1 Get Alert Reports
**Endpoint:** `GET /api/alert-reports`

**Description:** Lấy báo cáo cảnh báo có phân trang và lọc

**Query Parameters:**
- `fromDate` (required): Ngày bắt đầu (format: yyyy-MM-dd)
- `toDate` (required): Ngày kết thúc (format: yyyy-MM-dd)
- `page` (optional, default: 1): Số trang
- `size` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyword` (optional): Từ khóa tìm kiếm
- `severity` (optional): Mức độ nghiêm trọng (hoặc "ALL")
- `systemName` (optional): Tên hệ thống (hoặc "ALL")

**Response:**
```json
{
  "data": [],
  "systems": ["system1", "system2"],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 5
  }
}
```

---

### 7.2 Export Alert Reports
**Endpoint:** `GET /api/alert-reports/export`

**Description:** Xuất báo cáo cảnh báo ra file Excel

**Query Parameters:**
- `fromDate` (required): Ngày bắt đầu (format: yyyy-MM-dd)
- `toDate` (required): Ngày kết thúc (format: yyyy-MM-dd)
- `severity` (optional): Mức độ nghiêm trọng (hoặc "ALL")
- `systemName` (optional): Tên hệ thống (hoặc "ALL")

**Response:**
- Content-Type: application/octet-stream
- File: alert_report_{fromDate}_to_{toDate}.xlsx

---

## 8. Severity Config APIs

### 8.1 Get All Severity Configs
**Endpoint:** `GET /api/severity-config`

**Description:** Lấy danh sách cấu hình mức độ nghiêm trọng có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyword` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "createdAt"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 8.2 Create Severity Config
**Endpoint:** `POST /api/severity-config/create`

**Description:** Tạo cấu hình mức độ nghiêm trọng mới

**Request Body:**
```json
{
  "severity": "string",
  "description": "string",
  "threshold": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "severity": "string",
    "description": "string",
    "threshold": 0
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 8.3 Edit Severity Config
**Endpoint:** `POST /api/severity-config/edit?id={id}`

**Description:** Cập nhật cấu hình mức độ nghiêm trọng

**Query Parameters:**
- `id` (required): ID của cấu hình

**Request Body:**
```json
{
  "severity": "string",
  "description": "string",
  "threshold": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "severity": "string",
    "description": "string",
    "threshold": 0
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 8.4 Delete Severity Configs
**Endpoint:** `POST /api/severity-config/delete?ids={ids}`

**Description:** Xóa một hoặc nhiều cấu hình mức độ nghiêm trọng

**Query Parameters:**
- `ids` (required): Danh sách ID cấu hình cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 9. System APIs

### 9.1 Get All Systems
**Endpoint:** `GET /api/systems`

**Description:** Lấy danh sách hệ thống có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyWord` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 9.2 Create System
**Endpoint:** `POST /api/systems/create`

**Description:** Tạo hệ thống mới

**Request Body:**
```json
{
  "code": "string (required)",
  "name": "string (required)",
  "level1": "string",
  "level2": "string",
  "level3": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "code": "string",
    "name": "string",
    "level1": "string",
    "level2": "string",
    "level3": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 9.3 Edit System
**Endpoint:** `POST /api/systems/edit?id={id}`

**Description:** Cập nhật thông tin hệ thống

**Query Parameters:**
- `id` (required): ID của hệ thống

**Request Body:**
```json
{
  "code": "string (required)",
  "name": "string (required)",
  "level1": "string",
  "level2": "string",
  "level3": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "code": "string",
    "name": "string",
    "level1": "string",
    "level2": "string",
    "level3": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 9.4 Delete Systems
**Endpoint:** `POST /api/systems/delete?ids={ids}`

**Description:** Xóa một hoặc nhiều hệ thống

**Query Parameters:**
- `ids` (required): Danh sách ID hệ thống cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 10. System CR Log APIs

### 10.1 Get All System CR Logs
**Endpoint:** `GET /api/system-cr-log`

**Description:** Lấy danh sách CR log của hệ thống có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyword` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "startTime"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 10.2 Create System CR Log
**Endpoint:** `POST /api/system-cr-log/create`

**Description:** Tạo CR log của hệ thống mới

**Request Body:**
```json
{
  "systemId": "string",
  "crNumber": "string",
  "startTime": "2024-07-10T00:00:00.000Z",
  "endTime": "2024-07-10T23:59:59.999Z",
  "description": "string",
  "status": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "systemId": "string",
    "crNumber": "string",
    "startTime": "2024-07-10T00:00:00.000Z",
    "endTime": "2024-07-10T23:59:59.999Z",
    "description": "string",
    "status": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 10.3 Edit System CR Log
**Endpoint:** `POST /api/system-cr-log/edit?id={id}`

**Description:** Cập nhật CR log của hệ thống

**Query Parameters:**
- `id` (required): ID của CR log

**Request Body:**
```json
{
  "systemId": "string",
  "crNumber": "string",
  "startTime": "2024-07-10T00:00:00.000Z",
  "endTime": "2024-07-10T23:59:59.999Z",
  "description": "string",
  "status": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "systemId": "string",
    "crNumber": "string",
    "startTime": "2024-07-10T00:00:00.000Z",
    "endTime": "2024-07-10T23:59:59.999Z",
    "description": "string",
    "status": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 10.4 Delete System CR Logs
**Endpoint:** `POST /api/system-cr-log/delete?ids={ids}`

**Description:** Xóa một hoặc nhiều CR log của hệ thống

**Query Parameters:**
- `ids` (required): Danh sách ID CR log cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 11. User APIs

### 11.1 Get All Users
**Endpoint:** `GET /api/users`

**Description:** Lấy danh sách người dùng có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyWord` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 11.2 Create User
**Endpoint:** `POST /api/users/create`

**Description:** Tạo người dùng mới

**Request Body:**
```json
{
  "username": "string (max 200)",
  "password": "string (max 100)",
  "fullname": "string (max 100)",
  "status": 1,
  "userNote": "string (max 5000)",
  "email": "string (max 200)",
  "department": "string (max 200)",
  "mobilePhone": "string (max 50)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "fullname": "string",
    "email": "string",
    "department": "string",
    "mobilePhone": "string",
    "status": 1
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 11.3 Edit User
**Endpoint:** `POST /api/users/edit?id={id}`

**Description:** Cập nhật thông tin người dùng

**Query Parameters:**
- `id` (required): ID của người dùng

**Request Body:**
```json
{
  "username": "string (max 200)",
  "password": "string (max 100)",
  "fullname": "string (max 100)",
  "status": 1,
  "userNote": "string (max 5000)",
  "email": "string (max 200)",
  "department": "string (max 200)",
  "mobilePhone": "string (max 50)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "fullname": "string",
    "email": "string",
    "department": "string",
    "mobilePhone": "string",
    "status": 1
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 11.4 Delete Users
**Endpoint:** `POST /api/users/delete?ids={ids}`

**Description:** Xóa một hoặc nhiều người dùng

**Query Parameters:**
- `ids` (required): Danh sách ID người dùng cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 12. Warning Config APIs

### 12.1 Get All Warning Configs
**Endpoint:** `GET /api/config`

**Description:** Lấy danh sách cấu hình cảnh báo có phân trang

**Query Parameters:**
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số bản ghi trên mỗi trang
- `keyWord` (optional): Từ khóa tìm kiếm
- `sort_dir` (optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sort_key` (optional, default: "id"): Trường sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 12.2 Create Warning Config
**Endpoint:** `POST /api/config/create`

**Description:** Tạo cấu hình cảnh báo mới

**Request Body:**
```json
{
  "configName": "string",
  "configValue": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "configName": "string",
    "configValue": "string",
    "description": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 12.3 Edit Warning Config
**Endpoint:** `POST /api/config/edit?id={id}`

**Description:** Cập nhật cấu hình cảnh báo

**Query Parameters:**
- `id` (required): ID của cấu hình

**Request Body:**
```json
{
  "configName": "string",
  "configValue": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "configName": "string",
    "configValue": "string",
    "description": "string"
  },
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

### 12.4 Delete Warning Configs
**Endpoint:** `POST /api/config/delete?ids={ids}`

**Description:** Xóa một hoặc nhiều cấu hình cảnh báo

**Query Parameters:**
- `ids` (required): Danh sách ID cấu hình cần xóa (có thể truyền nhiều giá trị)

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "SUCCESS",
  "statusCode": 200
}
```

---

## 13. Internal Alert APIs

### 13.1 Receive Internal Alert
**Endpoint:** `POST /api/internal/alert`

**Description:** Nhận cảnh báo nội bộ từ hệ thống

**Request Body:**
```json
{
  "key1": "value1",
  "key2": "value2"
}
```
*Note: Request body nhận Map<String, Object> - có thể chứa bất kỳ trường nào*

**Response:**
```
✅ Đã nhận cảnh báo nội bộ
```

---

## Error Handling

Tất cả các API đều có thể trả về lỗi với format sau:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "statusCode": 400/404/500
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Request không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy resource
- `500 Internal Server Error`: Lỗi server

---

## Authentication

Hầu hết các API đều yêu cầu authentication bằng JWT token.

**Header:**
```
Authorization: Bearer {accessToken}
```

**Workflow:**
1. Gọi API `/api/auth/login` để lấy access token và refresh token
2. Sử dụng access token trong header `Authorization` cho các request tiếp theo
3. Khi access token hết hạn, gọi API `/api/auth/refresh-token` để lấy token mới
4. Khi đăng xuất, gọi API `/api/auth/logout` để vô hiệu hóa refresh token

---

## Notes

- Tất cả các query parameter có type `List<String>` hoặc `List<Integer>` có thể truyền nhiều giá trị bằng cách lặp lại tên parameter:
  ```
  ?ids=1&ids=2&ids=3
  ```

- Tất cả các endpoint có phân trang đều sử dụng các tham số:
  - `page`: Số trang (bắt đầu từ 1)
  - `limit` hoặc `size`: Số bản ghi trên mỗi trang
  - `sort_dir`: Hướng sắp xếp (asc/desc)
  - `sort_key`: Trường dùng để sắp xếp

- Datetime format: ISO 8601 (`yyyy-MM-dd'T'HH:mm:ss.SSSZ`)
- Date format: `yyyy-MM-dd`

---

**Document Version:** 1.0
**Last Updated:** 2025-07-10