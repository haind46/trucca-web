# API Documentation - Quản lý Thông tin Liên hệ và Nhóm Liên hệ

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [API Quản lý Thông tin Liên hệ (Contacts)](#api-quản-lý-thông-tin-liên-hệ-contacts)
3. [API Quản lý Nhóm Liên hệ (Group Contacts)](#api-quản-lý-nhóm-liên-hệ-group-contacts)

---

## Tổng quan

Base URL: `http://localhost:8002`

Tất cả API đều trả về response theo format:
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "statusCode": 200
}
```

**LƯU Ý QUAN TRỌNG VỀ CẤU TRÚC RESPONSE CHO API LIST:**

Tất cả API có phân trang (GET /api/contacts, GET /api/group_contacts, v.v.) đều trả về cấu trúc:
```json
{
  "success": true,
  "data": {
    "data": [...],        // Mảng dữ liệu (KHÔNG phải "content")
    "total": 12,          // Tổng số items (KHÔNG phải "totalElements")
    "page": 0,            // Số trang hiện tại (bắt đầu từ 0)
    "size": 10            // Số items mỗi trang
  },
  "message": "success",
  "statusCode": 200
}
```

**KHÁC BIỆT với Spring Boot pagination:**
- Backend sử dụng `data.data` thay vì `data.content`
- Backend sử dụng `total` thay vì `totalElements`
- Backend KHÔNG trả về `totalPages` - cần tính bằng: `Math.ceil(total / size)`
- Backend sử dụng `page` (0-indexed) thay vì `pageable.pageNumber`

---

## API Quản lý Thông tin Liên hệ (Contacts)

### 1. Lấy danh sách tất cả Contacts

**Endpoint:** `GET /api/contacts`

**Mô tả:** Lấy danh sách contacts với phân trang, tìm kiếm và sắp xếp

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang (bắt đầu từ 1)
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `keyword` (string, optional): Từ khóa tìm kiếm (tìm trong họ tên, đơn vị, email, số điện thoại)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/contacts?page=1&limit=10&keyword=Nguyen&sortDir=desc&sortKey=id
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "unit": "Ban Giám đốc",
        "email": "nguyenvana@company.com",
        "phone": "0901234567",
        "isActive": true,
        "notes": null,
        "createdAt": "2024-11-19T10:00:00Z",
        "updatedAt": "2024-11-19T10:00:00Z"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 1,
    "totalPages": 1
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 2. Tìm kiếm Contacts với bộ lọc nâng cao

**Endpoint:** `GET /api/contacts/filter`

**Mô tả:** Tìm kiếm contacts với các tiêu chí lọc chi tiết

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `fullName` (string, optional): Lọc theo họ tên
- `unit` (string, optional): Lọc theo đơn vị
- `email` (string, optional): Lọc theo email
- `phone` (string, optional): Lọc theo số điện thoại
- `isActive` (boolean, optional): Lọc theo trạng thái (true/false)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/contacts/filter?page=1&limit=10&unit=Phòng Vận hành&isActive=true
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 2,
        "fullName": "Trần Thị B",
        "unit": "Phòng Vận hành",
        "email": "tranthib@company.com",
        "phone": "0901234568",
        "isActive": true,
        "notes": null,
        "createdAt": "2024-11-19T10:00:00Z",
        "updatedAt": "2024-11-19T10:00:00Z"
      }
    ],
    "totalElements": 5,
    "totalPages": 1
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 3. Thêm mới Contact

**Endpoint:** `POST /api/contacts/create`

**Mô tả:** Tạo mới một contact

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "unit": "Ban Giám đốc",
  "email": "nguyenvana@company.com",
  "phone": "0901234567",
  "isActive": true,
  "notes": "Ghi chú"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "unit": "Ban Giám đốc",
    "email": "nguyenvana@company.com",
    "phone": "0901234567",
    "isActive": true,
    "notes": "Ghi chú",
    "createdAt": "2024-11-19T10:00:00Z",
    "updatedAt": "2024-11-19T10:00:00Z"
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 4. Sửa Contact

**Endpoint:** `POST /api/contacts/edit?id={id}`

**Mô tả:** Cập nhật thông tin contact

**Query Parameters:**
- `id` (long, required): ID của contact cần sửa

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A Updated",
  "unit": "Ban Giám đốc",
  "email": "nguyenvana.updated@company.com",
  "phone": "0901234567",
  "isActive": true,
  "notes": "Ghi chú đã cập nhật"
}
```

**Request Example:**
```
POST http://localhost:8002/api/contacts/edit?id=1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A Updated",
    "unit": "Ban Giám đốc",
    "email": "nguyenvana.updated@company.com",
    "phone": "0901234567",
    "isActive": true,
    "notes": "Ghi chú đã cập nhật",
    "createdAt": "2024-11-19T10:00:00Z",
    "updatedAt": "2024-11-19T11:00:00Z"
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 5. Xóa Contact (đơn)

**Endpoint:** `DELETE /api/contacts/delete/{id}`

**Mô tả:** Xóa một contact theo ID

**Path Parameters:**
- `id` (long, required): ID của contact cần xóa

**Request Example:**
```
DELETE http://localhost:8002/api/contacts/delete/1
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "Success",
  "statusCode": 200
}
```

---

### 6. Xóa nhiều Contacts

**Endpoint:** `POST /api/contacts/delete?ids={ids}`

**Mô tả:** Xóa nhiều contacts theo danh sách IDs

**Query Parameters:**
- `ids` (array of long, required): Danh sách ID các contacts cần xóa

**Request Example:**
```
POST http://localhost:8002/api/contacts/delete?ids=1,2,3
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "Success",
  "statusCode": 200
}
```

---

### 7. Sao chép Contact

**Endpoint:** `POST /api/contacts/copy/{id}`

**Mô tả:** Tạo bản sao của một contact

**Path Parameters:**
- `id` (long, required): ID của contact cần sao chép

**Request Example:**
```
POST http://localhost:8002/api/contacts/copy/1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 13,
    "fullName": "Nguyễn Văn A (Copy)",
    "unit": "Ban Giám đốc",
    "email": "nguyenvana@company.com",
    "phone": "0901234567",
    "isActive": true,
    "notes": "Ghi chú",
    "createdAt": "2024-11-19T12:00:00Z",
    "updatedAt": "2024-11-19T12:00:00Z"
  },
  "message": "Contact copied successfully",
  "statusCode": 200
}
```

---

### 8. Export Contacts ra file Excel

**Endpoint:** `GET /api/contacts/export`

**Mô tả:** Export tất cả contacts ra file Excel (.xlsx)

**Request Example:**
```
GET http://localhost:8002/api/contacts/export
```

**Response:** File Excel được download với tên `contacts_export.xlsx`

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

---

### 9. Import Contacts từ file

**Endpoint:** `POST /api/contacts/import`

**Mô tả:** Import contacts từ file Excel (.xlsx, .xls)

**Request:** Multipart form-data

**Form Data:**
- `file` (file, required): File Excel chứa dữ liệu contacts

**Request Example (sử dụng curl):**
```bash
curl -X POST http://localhost:8002/api/contacts/import \
  -F "file=@contacts.xlsx"
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 14,
      "fullName": "Imported Contact 1",
      "unit": "Phòng Vận hành",
      "email": "contact1@company.com",
      "phone": "0901234580",
      "isActive": true,
      "notes": null,
      "createdAt": "2024-11-19T13:00:00Z",
      "updatedAt": "2024-11-19T13:00:00Z"
    }
  ],
  "message": "Imported 1 contacts successfully",
  "statusCode": 200
}
```

**Lưu ý:** Bạn có thể tải template Excel mẫu từ endpoint `/api/contacts/template`

---

## API Quản lý Nhóm Liên hệ (Group Contacts)

### 1. Lấy danh sách tất cả Group Contacts

**Endpoint:** `GET /api/group_contacts`

**Mô tả:** Lấy danh sách nhóm liên hệ với phân trang, tìm kiếm và sắp xếp

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang (bắt đầu từ 1)
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `keyword` (string, optional): Từ khóa tìm kiếm (tìm trong tên nhóm, mô tả)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/group_contacts?page=1&limit=10&keyword=Khẩn cấp&sortDir=asc&sortKey=displayOrder
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Nhóm Khẩn cấp",
        "description": "Danh sách liên hệ khẩn cấp 24/7",
        "displayOrder": 1,
        "isActive": true,
        "createdAt": "2024-11-19T10:00:00Z",
        "updatedAt": "2024-11-19T10:00:00Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 2. Tìm kiếm Group Contacts với bộ lọc nâng cao

**Endpoint:** `GET /api/group_contacts/filter`

**Mô tả:** Tìm kiếm nhóm liên hệ với các tiêu chí lọc chi tiết

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `name` (string, optional): Lọc theo tên nhóm
- `description` (string, optional): Lọc theo mô tả
- `isActive` (boolean, optional): Lọc theo trạng thái (true/false)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/group_contacts/filter?page=1&limit=10&name=Vận hành&isActive=true
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 2,
        "name": "Nhóm Vận hành ca A",
        "description": "Nhân viên vận hành ca A",
        "displayOrder": 2,
        "isActive": true,
        "createdAt": "2024-11-19T10:00:00Z",
        "updatedAt": "2024-11-19T10:00:00Z"
      },
      {
        "id": 3,
        "name": "Nhóm Vận hành ca B",
        "description": "Nhân viên vận hành ca B",
        "displayOrder": 3,
        "isActive": true,
        "createdAt": "2024-11-19T10:00:00Z",
        "updatedAt": "2024-11-19T10:00:00Z"
      }
    ],
    "totalElements": 2,
    "totalPages": 1
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 3. Thêm mới Group Contact

**Endpoint:** `POST /api/group_contacts/create`

**Mô tả:** Tạo mới một nhóm liên hệ

**Request Body:**
```json
{
  "name": "Nhóm Khẩn cấp",
  "description": "Danh sách liên hệ khẩn cấp 24/7",
  "displayOrder": 1,
  "isActive": true
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nhóm Khẩn cấp",
    "description": "Danh sách liên hệ khẩn cấp 24/7",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-11-19T10:00:00Z",
    "updatedAt": "2024-11-19T10:00:00Z"
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 4. Sửa Group Contact

**Endpoint:** `POST /api/group_contacts/edit?id={id}`

**Mô tả:** Cập nhật thông tin nhóm liên hệ

**Query Parameters:**
- `id` (long, required): ID của group contact cần sửa

**Request Body:**
```json
{
  "name": "Nhóm Khẩn cấp Updated",
  "description": "Danh sách liên hệ khẩn cấp 24/7 - Đã cập nhật",
  "displayOrder": 1,
  "isActive": true
}
```

**Request Example:**
```
POST http://localhost:8002/api/group_contacts/edit?id=1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nhóm Khẩn cấp Updated",
    "description": "Danh sách liên hệ khẩn cấp 24/7 - Đã cập nhật",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-11-19T10:00:00Z",
    "updatedAt": "2024-11-19T11:00:00Z"
  },
  "message": "Success",
  "statusCode": 200
}
```

---

### 5. Xóa Group Contact (đơn)

**Endpoint:** `DELETE /api/group_contacts/delete/{id}`

**Mô tả:** Xóa một nhóm liên hệ theo ID

**Path Parameters:**
- `id` (long, required): ID của group contact cần xóa

**Request Example:**
```
DELETE http://localhost:8002/api/group_contacts/delete/1
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "Success",
  "statusCode": 200
}
```

---

### 6. Xóa nhiều Group Contacts

**Endpoint:** `POST /api/group_contacts/delete?ids={ids}`

**Mô tả:** Xóa nhiều nhóm liên hệ theo danh sách IDs

**Query Parameters:**
- `ids` (array of long, required): Danh sách ID các group contacts cần xóa

**Request Example:**
```
POST http://localhost:8002/api/group_contacts/delete?ids=1,2,3
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "Success",
  "statusCode": 200
}
```

---

### 7. Sao chép Group Contact

**Endpoint:** `POST /api/group_contacts/copy/{id}`

**Mô tả:** Tạo bản sao của một nhóm liên hệ

**Path Parameters:**
- `id` (long, required): ID của group contact cần sao chép

**Request Example:**
```
POST http://localhost:8002/api/group_contacts/copy/1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "Nhóm Khẩn cấp (Copy)",
    "description": "Danh sách liên hệ khẩn cấp 24/7",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-11-19T12:00:00Z",
    "updatedAt": "2024-11-19T12:00:00Z"
  },
  "message": "Group contact copied successfully",
  "statusCode": 200
}
```

---

### 8. Export Group Contacts ra file Excel

**Endpoint:** `GET /api/group_contacts/export`

**Mô tả:** Export tất cả group contacts ra file Excel (.xlsx)

**Request Example:**
```
GET http://localhost:8002/api/group_contacts/export
```

**Response:** File Excel được download với tên `group_contacts_export.xlsx`

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

---

### 9. Import Group Contacts từ file

**Endpoint:** `POST /api/group_contacts/import`

**Mô tả:** Import nhóm liên hệ từ file Excel (.xlsx, .xls)

**Request:** Multipart form-data

**Form Data:**
- `file` (file, required): File Excel chứa dữ liệu group contacts

**Request Example (sử dụng curl):**
```bash
curl -X POST http://localhost:8002/api/group_contacts/import \
  -F "file=@group_contacts.xlsx"
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "name": "Nhóm mới từ import",
      "description": "Mô tả nhóm",
      "displayOrder": 10,
      "isActive": true,
      "createdAt": "2024-11-19T13:00:00Z",
      "updatedAt": "2024-11-19T13:00:00Z"
    }
  ],
  "message": "Imported 1 group contacts successfully",
  "statusCode": 200
}
```

**Lưu ý:** Bạn có thể tải template Excel mẫu từ endpoint `/api/group_contacts/template`

---

## Error Responses

Khi có lỗi xảy ra, API sẽ trả về response với format:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "statusCode": 400
}
```

### Common Error Status Codes:
- `400`: Bad Request - Dữ liệu đầu vào không hợp lệ
- `404`: Not Found - Không tìm thấy resource
- `500`: Internal Server Error - Lỗi server

---

## Lưu ý khi sử dụng API

1. **Pagination**: Tất cả API list đều hỗ trợ phân trang. Page bắt đầu từ 1.

2. **Search Keyword**: Tham số `keyword` tìm kiếm gần đúng (fuzzy search) trên nhiều trường.

3. **Filter**: API filter cho phép lọc chính xác hơn với nhiều tiêu chí.

4. **Import/Export**:
   - Sử dụng `/template` endpoint để tải file mẫu trước khi import
   - File import phải đúng format của template
   - Cột "ID" trong file import có thể để trống khi thêm mới

5. **Date Format**: Tất cả ngày giờ đều sử dụng ISO 8601 format (UTC)

6. **Boolean Values**: Sử dụng `true`/`false` (lowercase)

---

**Phiên bản:** 1.0
**Ngày cập nhật:** 2024-11-19
