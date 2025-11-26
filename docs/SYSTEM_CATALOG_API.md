# API Quản lý Danh sách Hệ thống (System Catalog)

Base URL: `http://localhost:8002`

## Mục lục
1. [Lấy danh sách System Catalog](#1-lấy-danh-sách-system-catalog)
2. [Lấy System Catalog theo Code](#2-lấy-system-catalog-theo-code)
3. [Lấy danh sách System Catalog đang Active](#3-lấy-danh-sách-system-catalog-đang-active)
4. [Tạo mới System Catalog](#4-tạo-mới-system-catalog)
5. [Cập nhật System Catalog](#5-cập-nhật-system-catalog)
6. [Xóa System Catalog](#6-xóa-system-catalog)
7. [Sao chép System Catalog](#7-sao-chép-system-catalog)
8. [Xuất Excel](#8-xuất-excel)
9. [Nhập từ Excel](#9-nhập-từ-excel)
10. [Tải Template Excel](#10-tải-template-excel)
11. [Lấy danh sách Contacts đã gán](#11-lấy-danh-sách-contacts-đã-gán)
12. [Lấy danh sách Group Contacts đã gán](#12-lấy-danh-sách-group-contacts-đã-gán)
13. [Gán Contacts](#13-gán-contacts)
14. [Bỏ gán Contacts](#14-bỏ-gán-contacts)
15. [Gán Group Contacts](#15-gán-group-contacts)
16. [Bỏ gán Group Contacts](#16-bỏ-gán-group-contacts)

---

## 1. Lấy danh sách System Catalog

**Endpoint:** `GET /api/system-catalog`

**Mô tả:** Lấy danh sách hệ thống có phân trang và tìm kiếm

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số items trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong code, name, description, echat_id, ip_address, polestar_code) |
| sort_dir | String | Không | asc | Hướng sắp xếp: `asc` hoặc `desc` |
| sort_key | String | Không | name | Trường sắp xếp: `code`, `name`, `createdAt`, etc. |

**Request Example:**
```http
GET http://localhost:8002/api/system-catalog?page=1&limit=10&keyword=SYS&sort_dir=asc&sort_key=name
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
        "id": "1234567890",
        "code": "SYS001",
        "name": "Hệ thống cảnh báo trung tâm",
        "echatId": "ECHAT001",
        "ipAddress": "192.168.1.100",
        "polestarCode": "PS001",
        "systemLevelId": 1,
        "systemLevel": {
          "id": 1,
          "level": "Cấp 1",
          "description": "Hệ thống cấp 1"
        },
        "description": "Hệ thống cảnh báo trung tâm quản lý toàn bộ cảnh báo",
        "isActive": true,
        "createdAt": "2025-01-15T10:30:00Z",
        "createdBy": "admin",
        "updatedAt": "2025-01-15T10:30:00Z",
        "updatedBy": null
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

## 2. Lấy System Catalog theo Code

**Endpoint:** `GET /api/system-catalog/{code}`

**Mô tả:** Lấy thông tin chi tiết của một hệ thống theo code

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| code | String | Có | Mã hệ thống |

**Request Example:**
```http
GET http://localhost:8002/api/system-catalog/SYS001
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "1234567890",
    "code": "SYS001",
    "name": "Hệ thống cảnh báo trung tâm",
    "echatId": "ECHAT001",
    "ipAddress": "192.168.1.100",
    "polestarCode": "PS001",
    "systemLevelId": 1,
    "systemLevel": {
      "id": 1,
      "level": "Cấp 1",
      "description": "Hệ thống cấp 1"
    },
    "description": "Hệ thống cảnh báo trung tâm quản lý toàn bộ cảnh báo",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2025-01-15T10:30:00Z",
    "updatedBy": null
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SystemCatalog not found with code: SYS999",
  "data": null
}
```

---

## 3. Lấy danh sách System Catalog đang Active

**Endpoint:** `GET /api/system-catalog/active`

**Mô tả:** Lấy danh sách tất cả hệ thống đang active (không phân trang)

**Request Example:**
```http
GET http://localhost:8002/api/system-catalog/active
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "1234567890",
      "code": "SYS001",
      "name": "Hệ thống cảnh báo trung tâm",
      "echatId": "ECHAT001",
      "ipAddress": "192.168.1.100",
      "polestarCode": "PS001",
      "systemLevelId": 1,
      "description": "Hệ thống cảnh báo trung tâm",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "createdBy": "admin",
      "updatedAt": "2025-01-15T10:30:00Z",
      "updatedBy": null
    }
  ]
}
```

---

## 4. Tạo mới System Catalog

**Endpoint:** `POST /api/system-catalog/create`

**Mô tả:** Tạo mới một hệ thống

**Request Body:**
```json
{
  "code": "SYS002",
  "name": "Hệ thống giám sát mạng",
  "echatId": "ECHAT002",
  "ipAddress": "192.168.1.101",
  "polestarCode": "PS002",
  "systemLevelId": 2,
  "description": "Hệ thống giám sát mạng và thiết bị",
  "isActive": true,
  "createdBy": "admin",
  "contactIds": [1, 2, 3],
  "groupContactIds": [1, 2]
}
```

**Request Body Fields:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| code | String | Có | Mã hệ thống (unique, max 255 ký tự) |
| name | String | Có | Tên hệ thống (max 255 ký tự) |
| echatId | String | Không | EChat ID (max 255 ký tự) |
| ipAddress | String | Không | Địa chỉ IP (max 50 ký tự) |
| polestarCode | String | Không | Mã Polestar (max 255 ký tự) |
| systemLevelId | Long | Không | ID cấp độ hệ thống |
| description | String | Không | Mô tả |
| isActive | Boolean | Không | Trạng thái active (mặc định: true) |
| createdBy | String | Không | Người tạo |
| contactIds | Array[Long] | Không | Danh sách ID liên hệ được gán |
| groupContactIds | Array[Integer] | Không | Danh sách ID nhóm liên hệ được gán |

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "1234567891",
    "code": "SYS002",
    "name": "Hệ thống giám sát mạng",
    "echatId": "ECHAT002",
    "ipAddress": "192.168.1.101",
    "polestarCode": "PS002",
    "systemLevelId": 2,
    "description": "Hệ thống giám sát mạng và thiết bị",
    "isActive": true,
    "createdAt": "2025-01-15T11:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2025-01-15T11:00:00Z",
    "updatedBy": null
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Code already exists: SYS002",
  "data": null
}
```

---

## 5. Cập nhật System Catalog

**Endpoint:** `POST /api/system-catalog/edit`

**Mô tả:** Cập nhật thông tin hệ thống

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của hệ thống cần cập nhật |

**Request Body:**
```json
{
  "code": "SYS002_UPDATED",
  "name": "Hệ thống giám sát mạng (Đã cập nhật)",
  "echatId": "ECHAT002_NEW",
  "ipAddress": "192.168.1.102",
  "polestarCode": "PS002_NEW",
  "systemLevelId": 3,
  "description": "Hệ thống giám sát mạng và thiết bị - phiên bản mới",
  "isActive": true,
  "updatedBy": "admin",
  "contactIds": [1, 2, 4],
  "groupContactIds": [1, 3]
}
```

**Request Example:**
```http
POST http://localhost:8002/api/system-catalog/edit?id=1234567891
Content-Type: application/json

{
  "name": "Hệ thống giám sát mạng (Đã cập nhật)",
  "updatedBy": "admin"
}
```

**Lưu ý:**
- Chỉ cần gửi các field cần cập nhật
- Nếu gửi `contactIds` hoặc `groupContactIds`, hệ thống sẽ xóa toàn bộ quan hệ cũ và tạo mới theo danh sách gửi lên
- Nếu không gửi 2 field trên, quan hệ hiện tại sẽ được giữ nguyên

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "1234567891",
    "code": "SYS002_UPDATED",
    "name": "Hệ thống giám sát mạng (Đã cập nhật)",
    "echatId": "ECHAT002_NEW",
    "ipAddress": "192.168.1.102",
    "polestarCode": "PS002_NEW",
    "systemLevelId": 3,
    "description": "Hệ thống giám sát mạng và thiết bị - phiên bản mới",
    "isActive": true,
    "createdAt": "2025-01-15T11:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2025-01-15T12:00:00Z",
    "updatedBy": "admin"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SystemCatalog not found",
  "data": null
}
```

---

## 6. Xóa System Catalog

**Endpoint:** `POST /api/system-catalog/delete`

**Mô tả:** Xóa một hoặc nhiều hệ thống

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| ids | Array[String] | Có | Danh sách ID cần xóa |

**Request Example:**
```http
POST http://localhost:8002/api/system-catalog/delete?ids=1234567890&ids=1234567891
```

hoặc

```http
POST http://localhost:8002/api/system-catalog/delete?ids=1234567890,1234567891
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": null
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SystemCatalog with ID 1234567890 not found",
  "data": null
}
```

**Lưu ý:** Khi xóa hệ thống, tất cả quan hệ với contacts và group_contacts cũng sẽ bị xóa theo (CASCADE)

---

## 7. Sao chép System Catalog

**Endpoint:** `POST /api/system-catalog/copy`

**Mô tả:** Sao chép một hệ thống (bao gồm cả quan hệ contacts và group_contacts)

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của hệ thống cần sao chép |

**Request Example:**
```http
POST http://localhost:8002/api/system-catalog/copy?id=1234567890
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Copied successfully",
  "data": {
    "id": "1234567892",
    "code": "SYS001_copy",
    "name": "Hệ thống cảnh báo trung tâm (Copy)",
    "echatId": "ECHAT001",
    "ipAddress": "192.168.1.100",
    "polestarCode": "PS001",
    "systemLevelId": 1,
    "description": "Hệ thống cảnh báo trung tâm quản lý toàn bộ cảnh báo",
    "isActive": false,
    "createdAt": "2025-01-15T13:00:00Z",
    "createdBy": null,
    "updatedAt": "2025-01-15T13:00:00Z",
    "updatedBy": null
  }
}
```

**Lưu ý:**
- Bản sao sẽ có code = `{code_gốc}_copy`
- Bản sao sẽ có name = `{name_gốc} (Copy)`
- Bản sao mặc định có `isActive = false`
- Tất cả quan hệ contacts và group_contacts cũng được sao chép

---

## 8. Xuất Excel

**Endpoint:** `GET /api/system-catalog/export`

**Mô tả:** Xuất toàn bộ danh sách hệ thống ra file Excel

**Request Example:**
```http
GET http://localhost:8002/api/system-catalog/export
```

**Response:** File Excel (.xlsx) với tên `system_catalog_export.xlsx`

**Cấu trúc file Excel:**

| Mã | Tên | EChat ID | Địa chỉ IP | Mã Polestar | System Level ID | Mô tả | Kích hoạt |
|----|-----|----------|------------|-------------|-----------------|-------|-----------|
| SYS001 | Hệ thống... | ECHAT001 | 192.168.1.100 | PS001 | 1 | Mô tả... | Có |

---

## 9. Nhập từ Excel

**Endpoint:** `POST /api/system-catalog/import`

**Mô tả:** Nhập dữ liệu hệ thống từ file Excel

**Content-Type:** `multipart/form-data`

**Form Data:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| file | File | Có | File Excel (.xlsx) |

**Request Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8002/api/system-catalog/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Request Example (cURL):**
```bash
curl -X POST http://localhost:8002/api/system-catalog/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@system_catalog_import.xlsx"
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Imported 10 items",
  "data": [
    {
      "id": "1234567893",
      "code": "SYS010",
      "name": "Hệ thống mới từ import",
      "echatId": "ECHAT010",
      "ipAddress": "192.168.1.110",
      "polestarCode": "PS010",
      "systemLevelId": 1,
      "description": "Import từ Excel",
      "isActive": true,
      "createdAt": "2025-01-15T14:00:00Z",
      "createdBy": null,
      "updatedAt": "2025-01-15T14:00:00Z",
      "updatedBy": null
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
- File Excel phải có đúng cấu trúc (8 cột như template)
- Các dòng thiếu `Mã` hoặc `Tên` sẽ bị bỏ qua
- Nếu mã đã tồn tại, sẽ xảy ra lỗi

---

## 10. Tải Template Excel

**Endpoint:** `GET /api/system-catalog/template`

**Mô tả:** Tải file template Excel để import

**Request Example:**
```http
GET http://localhost:8002/api/system-catalog/template
```

**Response:** File Excel (.xlsx) với tên `system_catalog_template.xlsx`

**Nội dung template:**

| Mã | Tên | EChat ID | Địa chỉ IP | Mã Polestar | System Level ID | Mô tả | Kích hoạt |
|----|-----|----------|------------|-------------|-----------------|-------|-----------|
| SYS001 | Hệ thống mẫu 1 | ECHAT001 | 192.168.1.1 | PS001 | 1 | Mô tả hệ thống mẫu | Có |

---

## 11. Lấy danh sách Contacts đã gán

**Endpoint:** `GET /api/system-catalog/{id}/contacts`

**Mô tả:** Lấy danh sách tất cả contacts đã được gán cho một system catalog

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của system catalog |

**Request Example:**
```http
GET http://localhost:8002/api/system-catalog/1234567890/contacts
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "abc-123-def",
      "systemCatalogId": "1234567890",
      "contactId": 1,
      "contact": {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0901234567",
        "departmentId": 1,
        "isActive": true
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "createdBy": "admin"
    },
    {
      "id": "xyz-456-ghi",
      "systemCatalogId": "1234567890",
      "contactId": 2,
      "contact": {
        "id": 2,
        "fullName": "Trần Thị B",
        "email": "tranthib@example.com",
        "phone": "0912345678",
        "departmentId": 2,
        "isActive": true
      },
      "createdAt": "2025-01-15T11:00:00Z",
      "createdBy": "admin"
    }
  ]
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SystemCatalog not found with id: 1234567890",
  "data": null
}
```

---

## 12. Lấy danh sách Group Contacts đã gán

**Endpoint:** `GET /api/system-catalog/{id}/group-contacts`

**Mô tả:** Lấy danh sách tất cả group contacts đã được gán cho một system catalog

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của system catalog |

**Request Example:**
```http
GET http://localhost:8002/api/system-catalog/1234567890/group-contacts
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "group-abc-123",
      "systemCatalogId": "1234567890",
      "groupContactId": 1,
      "groupContact": {
        "id": 1,
        "name": "Nhóm quản trị hệ thống",
        "description": "Nhóm các quản trị viên hệ thống",
        "displayOrder": 1,
        "isActive": true
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "createdBy": "admin"
    }
  ]
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SystemCatalog not found with id: 1234567890",
  "data": null
}
```

---

## 13. Gán Contacts

**Endpoint:** `POST /api/system-catalog/{id}/assign-contacts`

**Mô tả:** Gán thêm một hoặc nhiều contacts cho system catalog (không xóa contacts đã gán trước đó)

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của system catalog |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| contactIds | Array[Long] | Có | Danh sách ID contacts cần gán |
| createdBy | String | Không | Người thực hiện gán |

**Request Example:**
```http
POST http://localhost:8002/api/system-catalog/1234567890/assign-contacts?contactIds=1&contactIds=2&contactIds=3&createdBy=admin
```

hoặc

```http
POST http://localhost:8002/api/system-catalog/1234567890/assign-contacts?contactIds=1,2,3&createdBy=admin
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Contacts assigned successfully",
  "data": null
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "ContactIds cannot be empty",
  "data": null
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SystemCatalog not found with id: 1234567890",
  "data": null
}
```

**Lưu ý:**
- API này chỉ thêm mới, không xóa contacts đã gán trước đó
- Nếu contact đã được gán rồi thì bỏ qua (không gán lại)

---

## 14. Bỏ gán Contacts

**Endpoint:** `POST /api/system-catalog/{id}/unassign-contacts`

**Mô tả:** Bỏ gán một hoặc nhiều contacts khỏi system catalog

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của system catalog |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| contactIds | Array[Long] | Có | Danh sách ID contacts cần bỏ gán |

**Request Example:**
```http
POST http://localhost:8002/api/system-catalog/1234567890/unassign-contacts?contactIds=1&contactIds=2
```

hoặc

```http
POST http://localhost:8002/api/system-catalog/1234567890/unassign-contacts?contactIds=1,2
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Contacts unassigned successfully",
  "data": null
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "ContactIds cannot be empty",
  "data": null
}
```

**Lưu ý:**
- Nếu contact không được gán cho system catalog này thì bỏ qua (không báo lỗi)

---

## 15. Gán Group Contacts

**Endpoint:** `POST /api/system-catalog/{id}/assign-group-contacts`

**Mô tả:** Gán thêm một hoặc nhiều group contacts cho system catalog (không xóa group contacts đã gán trước đó)

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của system catalog |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| groupContactIds | Array[Integer] | Có | Danh sách ID group contacts cần gán |
| createdBy | String | Không | Người thực hiện gán |

**Request Example:**
```http
POST http://localhost:8002/api/system-catalog/1234567890/assign-group-contacts?groupContactIds=1&groupContactIds=2&createdBy=admin
```

hoặc

```http
POST http://localhost:8002/api/system-catalog/1234567890/assign-group-contacts?groupContactIds=1,2&createdBy=admin
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Group contacts assigned successfully",
  "data": null
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "GroupContactIds cannot be empty",
  "data": null
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "SystemCatalog not found with id: 1234567890",
  "data": null
}
```

**Lưu ý:**
- API này chỉ thêm mới, không xóa group contacts đã gán trước đó
- Nếu group contact đã được gán rồi thì bỏ qua (không gán lại)

---

## 16. Bỏ gán Group Contacts

**Endpoint:** `POST /api/system-catalog/{id}/unassign-group-contacts`

**Mô tả:** Bỏ gán một hoặc nhiều group contacts khỏi system catalog

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | String | Có | ID của system catalog |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| groupContactIds | Array[Integer] | Có | Danh sách ID group contacts cần bỏ gán |

**Request Example:**
```http
POST http://localhost:8002/api/system-catalog/1234567890/unassign-group-contacts?groupContactIds=1&groupContactIds=2
```

hoặc

```http
POST http://localhost:8002/api/system-catalog/1234567890/unassign-group-contacts?groupContactIds=1,2
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Group contacts unassigned successfully",
  "data": null
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "GroupContactIds cannot be empty",
  "data": null
}
```

**Lưu ý:**
- Nếu group contact không được gán cho system catalog này thì bỏ qua (không báo lỗi)

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
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 404 | Not Found - Không tìm thấy resource |
| 500 | Internal Server Error - Lỗi server |

## Lưu ý quan trọng

1. **Authentication:** Tất cả API cần có token xác thực (nếu có middleware auth)
2. **Content-Type:** Sử dụng `application/json` cho các API POST/PUT (trừ import)
3. **Encoding:** UTF-8
4. **Date Format:** ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
5. **Quan hệ:**
   - Khi tạo/cập nhật, có thể gửi `contactIds` và `groupContactIds` để gán liên hệ
   - Khi cập nhật quan hệ, hệ thống sẽ xóa toàn bộ quan hệ cũ và tạo mới
6. **Validation:**
   - `code` và `name` là bắt buộc
   - `code` phải unique
   - `code` max 255 ký tự
   - `name` max 255 ký tự
   - `ipAddress` max 50 ký tự

---

**Ngày tạo:** 2025-01-26
**Phiên bản:** 1.0
**Base URL:** http://localhost:8002
