# Tài liệu API - Quản lý Cấp độ Hệ thống & Vai trò

## Mục lục
1. [Quản lý Cấp độ Hệ thống (System Level)](#1-quản-lý-cấp-độ-hệ-thống-system-level)
2. [Quản lý Vai trò (Roles)](#2-quản-lý-vai-trò-roles)

---

## 1. Quản lý Cấp độ Hệ thống (System Level)

Base URL: `http://localhost:8002/api/systemLevel`

### 1.1. Lấy danh sách tất cả System Level (với phân trang)

**Endpoint:** `GET /api/systemLevel/`

**Method:** `GET`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số lượng item trên mỗi trang |
| keyWord | String | Không | - | Từ khóa tìm kiếm (tìm trong level, description, created_by, updated_by) |
| sortDir | String | Không | desc | Hướng sắp xếp (asc/desc) |
| sortKey | String | Không | id | Trường để sắp xếp |

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/systemLevel/?page=1&limit=10&keyWord=Critical&sortDir=desc&sortKey=id
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "level": "Critical",
        "description": "Critical system level requiring immediate attention",
        "createdAt": "2024-11-15T10:30:00Z",
        "createdBy": "admin",
        "updatedAt": "2024-11-15T10:30:00Z",
        "updatedBy": "admin"
      }
    ],
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### 1.2. Tìm kiếm nâng cao System Level (Filter)

**Endpoint:** `GET /api/systemLevel/filter`

**Method:** `GET`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số lượng item trên mỗi trang |
| level | String | Không | - | Lọc theo tên level |
| description | String | Không | - | Lọc theo mô tả |
| createdBy | String | Không | - | Lọc theo người tạo |
| sortDir | String | Không | desc | Hướng sắp xếp |
| sortKey | String | Không | id | Trường để sắp xếp |

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/systemLevel/filter?page=1&limit=10&level=Critical&description=immediate&createdBy=admin
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [...],
    "totalItems": 5,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### 1.3. Thêm mới System Level

**Endpoint:** `POST /api/systemLevel/create`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "level": "Critical",
  "description": "Critical system level requiring immediate attention",
  "createdBy": "admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "level": "Critical",
    "description": "Critical system level requiring immediate attention",
    "createdAt": "2024-11-15T10:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-15T10:30:00Z",
    "updatedBy": null
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "System level already exists: Critical",
  "data": null
}
```

---

### 1.4. Cập nhật System Level

**Endpoint:** `POST /api/systemLevel/edit`

**Method:** `POST`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| id | Long | Có | ID của System Level cần cập nhật |

**Headers:**
```
Content-Type: application/json
```

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/systemLevel/edit?id=1
```

**Request Body:**
```json
{
  "level": "Critical - Updated",
  "description": "Updated critical level description",
  "updatedBy": "admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "level": "Critical - Updated",
    "description": "Updated critical level description",
    "createdAt": "2024-11-15T10:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-15T11:00:00Z",
    "updatedBy": "admin"
  }
}
```

---

### 1.5. Xóa một System Level

**Endpoint:** `DELETE /api/systemLevel/delete/{id}`

**Method:** `DELETE`

**Path Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| id | Long | Có | ID của System Level cần xóa |

**Ví dụ Request:**
```bash
DELETE http://localhost:8002/api/systemLevel/delete/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": null
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "System level with ID 1 not found",
  "data": null
}
```

---

### 1.6. Xóa nhiều System Level

**Endpoint:** `POST /api/systemLevel/delete`

**Method:** `POST`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| ids | List<Long> | Có | Danh sách ID cần xóa (cách nhau bởi dấu phẩy) |

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/systemLevel/delete?ids=1,2,3
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": null
}
```

---

### 1.7. Sao chép System Level

**Endpoint:** `POST /api/systemLevel/copy/{id}`

**Method:** `POST`

**Path Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| id | Long | Có | ID của System Level cần sao chép |

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/systemLevel/copy/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 4,
    "level": "Critical (Copy)",
    "description": "Critical system level requiring immediate attention",
    "createdAt": "2024-11-15T11:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-15T11:30:00Z",
    "updatedBy": null
  }
}
```

---

### 1.8. Export System Level ra Excel

**Endpoint:** `GET /api/systemLevel/export`

**Method:** `GET`

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/systemLevel/export
```

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `system_levels_export.xlsx`

---

### 1.9. Import System Level từ file

**Endpoint:** `POST /api/systemLevel/import`

**Method:** `POST`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| file | File | Có | File Excel (.xlsx, .xls), CSV (.csv), hoặc TXT (.txt) |

**File Format (Excel/CSV):**

| Level | Description | Created By |
|-------|-------------|------------|
| Critical | Critical level | admin |
| High | High priority level | admin |

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/systemLevel/import
Content-Type: multipart/form-data

file: [your_file.xlsx]
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Imported 5 system levels successfully",
  "data": [
    {
      "id": 5,
      "level": "Critical",
      "description": "Critical level",
      "createdBy": "admin",
      ...
    }
  ]
}
```

---

### 1.10. Tải template Excel để import

**Endpoint:** `GET /api/systemLevel/template`

**Method:** `GET`

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/systemLevel/template
```

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `system_levels_template.xlsx`

---

## 2. Quản lý Vai trò (Roles)

Base URL: `http://localhost:8002/api/roles`

### 2.1. Lấy danh sách tất cả Roles (với phân trang)

**Endpoint:** `GET /api/roles/`

**Method:** `GET`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số lượng item trên mỗi trang |
| keyWord | String | Không | - | Từ khóa tìm kiếm (tìm trong name, code, description, status, created_by, updated_by) |
| sortDir | String | Không | desc | Hướng sắp xếp (asc/desc) |
| sortKey | String | Không | id | Trường để sắp xếp |

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/roles/?page=1&limit=10&keyWord=Admin&sortDir=desc&sortKey=id
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Administrator",
        "code": "ADMIN",
        "description": "Full system access with all permissions",
        "status": "active",
        "createdAt": "2024-11-15T10:30:00Z",
        "createdBy": "admin",
        "updatedAt": "2024-11-15T10:30:00Z",
        "updatedBy": "admin"
      }
    ],
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### 2.2. Tìm kiếm nâng cao Roles (Filter)

**Endpoint:** `GET /api/roles/filter`

**Method:** `GET`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số lượng item trên mỗi trang |
| name | String | Không | - | Lọc theo tên role |
| code | String | Không | - | Lọc theo mã code |
| description | String | Không | - | Lọc theo mô tả |
| status | String | Không | - | Lọc theo trạng thái (active/inactive) |
| createdBy | String | Không | - | Lọc theo người tạo |
| sortDir | String | Không | desc | Hướng sắp xếp |
| sortKey | String | Không | id | Trường để sắp xếp |

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/roles/filter?page=1&limit=10&name=Admin&code=ADMIN&status=active
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [...],
    "totalItems": 3,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### 2.3. Thêm mới Role

**Endpoint:** `POST /api/roles/create`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Administrator",
  "code": "ADMIN",
  "description": "Full system access with all permissions",
  "status": "active",
  "createdBy": "admin"
}
```

**Lưu ý:**
- `code` phải là duy nhất (unique)
- `status` có thể là `active` hoặc `inactive`

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Administrator",
    "code": "ADMIN",
    "description": "Full system access with all permissions",
    "status": "active",
    "createdAt": "2024-11-15T10:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-15T10:30:00Z",
    "updatedBy": null
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Role code already exists: ADMIN",
  "data": null
}
```

---

### 2.4. Cập nhật Role

**Endpoint:** `POST /api/roles/edit`

**Method:** `POST`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| id | Long | Có | ID của Role cần cập nhật |

**Headers:**
```
Content-Type: application/json
```

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/roles/edit?id=1
```

**Request Body:**
```json
{
  "name": "Super Administrator",
  "code": "SUPER_ADMIN",
  "description": "Updated description with full permissions",
  "status": "active",
  "updatedBy": "admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Super Administrator",
    "code": "SUPER_ADMIN",
    "description": "Updated description with full permissions",
    "status": "active",
    "createdAt": "2024-11-15T10:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-15T11:00:00Z",
    "updatedBy": "admin"
  }
}
```

---

### 2.5. Xóa một Role

**Endpoint:** `DELETE /api/roles/delete/{id}`

**Method:** `DELETE`

**Path Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| id | Long | Có | ID của Role cần xóa |

**Ví dụ Request:**
```bash
DELETE http://localhost:8002/api/roles/delete/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": null
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Role with ID 1 not found",
  "data": null
}
```

---

### 2.6. Xóa nhiều Roles

**Endpoint:** `POST /api/roles/delete`

**Method:** `POST`

**Query Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| ids | List<Long> | Có | Danh sách ID cần xóa (cách nhau bởi dấu phẩy) |

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/roles/delete?ids=1,2,3
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": null
}
```

---

### 2.7. Sao chép Role

**Endpoint:** `POST /api/roles/copy/{id}`

**Method:** `POST`

**Path Parameters:**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| id | Long | Có | ID của Role cần sao chép |

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/roles/copy/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 4,
    "name": "Administrator (Copy)",
    "code": "ADMIN_COPY_1699876543210",
    "description": "Full system access with all permissions",
    "status": "active",
    "createdAt": "2024-11-15T11:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-15T11:30:00Z",
    "updatedBy": null
  }
}
```

**Lưu ý:** Code của role copy sẽ tự động thêm suffix `_COPY_` + timestamp để đảm bảo tính duy nhất.

---

### 2.8. Export Roles ra Excel

**Endpoint:** `GET /api/roles/export`

**Method:** `GET`

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/roles/export
```

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `roles_export.xlsx`

---

### 2.9. Import Roles từ file

**Endpoint:** `POST /api/roles/import`

**Method:** `POST`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| file | File | Có | File Excel (.xlsx, .xls), CSV (.csv), hoặc TXT (.txt) |

**File Format (Excel/CSV):**

| Name | Code | Description | Status | Created By |
|------|------|-------------|--------|------------|
| Administrator | ADMIN | Full system access | active | admin |
| User | USER | Basic user access | active | admin |

**Ví dụ Request:**
```bash
POST http://localhost:8002/api/roles/import
Content-Type: multipart/form-data

file: [your_file.xlsx]
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Imported 5 roles successfully",
  "data": [
    {
      "id": 5,
      "name": "Administrator",
      "code": "ADMIN",
      "description": "Full system access",
      "status": "active",
      "createdBy": "admin",
      ...
    }
  ]
}
```

---

### 2.10. Tải template Excel để import

**Endpoint:** `GET /api/roles/template`

**Method:** `GET`

**Ví dụ Request:**
```bash
GET http://localhost:8002/api/roles/template
```

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `roles_template.xlsx`

---

## Lưu ý chung

### 1. Query Parameter quan trọng

**⚠️ CHÚ Ý:** Tham số tìm kiếm trong API là `keyWord` (camelCase), KHÔNG phải `keyword`. Hãy đảm bảo sử dụng đúng:

✅ **ĐÚNG:**
```
GET /api/systemLevel/?keyWord=Critical
GET /api/roles/?keyWord=Admin
```

❌ **SAI:**
```
GET /api/systemLevel/?keyword=Critical  // Sẽ không hoạt động
GET /api/roles/?keyword=Admin           // Sẽ không hoạt động
```

### 2. Phân trang

- `page` bắt đầu từ 1 (không phải 0)
- `limit` mặc định là 10 items/trang
- Response trả về sẽ có thông tin: `totalItems`, `totalPages`, `currentPage`

### 3. Sắp xếp

- `sortDir`: `asc` (tăng dần) hoặc `desc` (giảm dần)
- `sortKey`: tên trường cần sắp xếp (ví dụ: `id`, `name`, `code`, `createdAt`)

### 4. Trạng thái HTTP Response

| Status Code | Mô tả |
|-------------|-------|
| 200 | Thành công |
| 400 | Dữ liệu đầu vào không hợp lệ |
| 404 | Không tìm thấy tài nguyên |
| 500 | Lỗi server |

### 5. Format Response chung

Tất cả các API đều trả về cùng format:

```json
{
  "success": true/false,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... } // hoặc null
}
```

### 6. Import/Export

- Hỗ trợ file: `.xlsx`, `.xls`, `.csv`, `.txt`
- File CSV/TXT sử dụng dấu phẩy (,) để phân cách
- Dòng đầu tiên là header, các dòng tiếp theo là dữ liệu
- Nên tải template về để đảm bảo đúng format

---

## Ví dụ sử dụng với JavaScript (Fetch API)

### Lấy danh sách System Level
```javascript
fetch('http://localhost:8002/api/systemLevel/?page=1&limit=10&keyWord=Critical', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Thêm mới Role
```javascript
fetch('http://localhost:8002/api/roles/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Full system access',
    status: 'active',
    createdBy: 'admin'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Upload file import
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8002/api/roles/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

**Ngày cập nhật:** 2024-11-15
**Phiên bản API:** 1.0
