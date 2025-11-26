
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
