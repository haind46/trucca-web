# API Documentation - Management Modules

Tài liệu API cho các module quản lý: **System Level**, **Roles**, **Alert Frequency**, và **Operation Type**.

**Base URL:** `http://localhost:8002`

---

## 1. System Level Management (Quản lý Cấp độ Hệ thống)

### 1.1. Lấy danh sách System Level

**Endpoint:** `GET /api/systemLevel/`

**Mô tả:** Lấy danh sách cấp độ hệ thống với phân trang, sắp xếp và tìm kiếm.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số bản ghi trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong level, description, created_by, updated_by) |
| sortDir | String | Không | desc | Hướng sắp xếp (asc/desc) |
| sortKey | String | Không | id | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/systemLevel/?page=1&limit=10&sortDir=desc&sortKey=id&keyword=1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "level": "1",
        "description": "Hệ thống cấp độ 1",
        "createdAt": "2025-11-15T02:23:42.035006Z",
        "createdBy": "system",
        "updatedAt": "2025-11-15T02:23:42.035006Z",
        "updatedBy": "system"
      }
    ],
    "total": 1,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 1.2. Filter System Level (Lọc nâng cao)

**Endpoint:** `GET /api/systemLevel/filter`

**Mô tả:** Lọc cấp độ hệ thống theo các tiêu chí nâng cao.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số bản ghi/trang |
| level | String | Không | - | Lọc theo level |
| description | String | Không | - | Lọc theo description |
| createdBy | String | Không | - | Lọc theo người tạo |
| sortDir | String | Không | desc | Hướng sắp xếp |
| sortKey | String | Không | id | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/systemLevel/filter?page=1&limit=10&level=1&sortDir=desc&sortKey=id
```

**Response:** Giống như API 1.1

---

### 1.3. Tạo mới System Level

**Endpoint:** `POST /api/systemLevel/create`

**Mô tả:** Tạo mới một cấp độ hệ thống.

**Request Body:**
```json
{
  "level": "4",
  "description": "Hệ thống cấp độ 4",
  "createdBy": "admin",
  "updatedBy": "admin"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "level": "4",
    "description": "Hệ thống cấp độ 4",
    "createdAt": "2025-11-16T10:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2025-11-16T10:00:00Z",
    "updatedBy": "admin"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 1.4. Cập nhật System Level

**Endpoint:** `POST /api/systemLevel/edit`

**Mô tả:** Cập nhật thông tin cấp độ hệ thống.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của System Level cần cập nhật |

**Request Body:**
```json
{
  "level": "4",
  "description": "Hệ thống cấp độ 4 - Updated",
  "updatedBy": "admin"
}
```

**Request Example:**
```
POST http://localhost:8002/api/systemLevel/edit?id=4
```

**Response:** Giống như API 1.3

---

### 1.5. Xóa System Level (đơn)

**Endpoint:** `DELETE /api/systemLevel/delete/{id}`

**Mô tả:** Xóa một cấp độ hệ thống theo ID.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của System Level cần xóa |

**Request Example:**
```
DELETE http://localhost:8002/api/systemLevel/delete/4
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "success",
  "statusCode": 200
}
```

---

### 1.6. Xóa nhiều System Level

**Endpoint:** `POST /api/systemLevel/delete`

**Mô tả:** Xóa nhiều cấp độ hệ thống cùng lúc.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| ids | List<Long> | Có | Danh sách ID cần xóa |

**Request Example:**
```
POST http://localhost:8002/api/systemLevel/delete?ids=1,2,3
```

**Response:** Giống như API 1.5

---

### 1.7. Copy System Level

**Endpoint:** `POST /api/systemLevel/copy/{id}`

**Mô tả:** Sao chép một cấp độ hệ thống.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của System Level cần copy |

**Request Example:**
```
POST http://localhost:8002/api/systemLevel/copy/1
```

**Response:** Giống như API 1.3 (có thêm " (Copy)" trong tên)

---

### 1.8. Export System Level

**Endpoint:** `GET /api/systemLevel/export`

**Mô tả:** Xuất danh sách System Level ra file Excel.

**Request Example:**
```
GET http://localhost:8002/api/systemLevel/export
```

**Response:** File Excel (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

### 1.9. Import System Level

**Endpoint:** `POST /api/systemLevel/import`

**Mô tả:** Nhập dữ liệu System Level từ file Excel/CSV/TXT.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data với key `file` chứa file upload

**Request Example:**
```
POST http://localhost:8002/api/systemLevel/import
Content-Type: multipart/form-data

file: [Excel/CSV/TXT file]
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "level": "5",
      "description": "Imported level",
      "createdAt": "2025-11-16T10:00:00Z",
      "createdBy": "admin",
      "updatedAt": "2025-11-16T10:00:00Z",
      "updatedBy": "admin"
    }
  ],
  "message": "Imported 1 system levels successfully",
  "statusCode": 200
}
```

---

### 1.10. Download Template

**Endpoint:** `GET /api/systemLevel/template`

**Mô tả:** Tải file Excel mẫu để import.

**Request Example:**
```
GET http://localhost:8002/api/systemLevel/template
```

**Response:** File Excel template

---

## 2. Roles Management (Quản lý Vai trò)

### 2.1. Lấy danh sách Roles

**Endpoint:** `GET /api/roles/`

**Mô tả:** Lấy danh sách vai trò với phân trang, sắp xếp và tìm kiếm.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số bản ghi trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong name, description) |
| sortDir | String | Không | desc | Hướng sắp xếp (asc/desc) |
| sortKey | String | Không | id | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/roles/?page=1&limit=10&sortDir=desc&sortKey=id&keyword=bảo trì
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 6,
        "name": "Bộ phận kỹ thuật",
        "description": "Nhân viên kỹ thuật bảo trì",
        "displayOrder": 6,
        "isActive": true,
        "createdAt": "2025-11-13T03:40:23.382966Z",
        "updatedAt": "2025-11-13T03:40:23.382966Z"
      }
    ],
    "total": 1,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 2.2. Filter Roles (Lọc nâng cao)

**Endpoint:** `GET /api/roles/filter`

**Mô tả:** Lọc vai trò theo các tiêu chí nâng cao.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số bản ghi/trang |
| name | String | Không | - | Lọc theo tên |
| description | String | Không | - | Lọc theo mô tả |
| isActive | Boolean | Không | - | Lọc theo trạng thái (true/false) |
| sortDir | String | Không | desc | Hướng sắp xếp |
| sortKey | String | Không | id | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/roles/filter?page=1&limit=10&name=kỹ thuật&isActive=true&sortDir=desc&sortKey=id
```

**Response:** Giống như API 2.1

---

### 2.3. Tạo mới Role

**Endpoint:** `POST /api/roles/create`

**Mô tả:** Tạo mới một vai trò.

**Request Body:**
```json
{
  "name": "Quản trị viên",
  "description": "Vai trò quản trị viên hệ thống",
  "displayOrder": 1,
  "isActive": true
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "Quản trị viên",
    "description": "Vai trò quản trị viên hệ thống",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2025-11-16T10:00:00Z",
    "updatedAt": "2025-11-16T10:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 2.4. Cập nhật Role

**Endpoint:** `POST /api/roles/edit`

**Mô tả:** Cập nhật thông tin vai trò.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Role cần cập nhật |

**Request Body:**
```json
{
  "name": "Quản trị viên hệ thống",
  "description": "Vai trò quản trị viên - Updated",
  "displayOrder": 1,
  "isActive": true
}
```

**Request Example:**
```
POST http://localhost:8002/api/roles/edit?id=7
```

**Response:** Giống như API 2.3

---

### 2.5. Xóa Role (đơn)

**Endpoint:** `DELETE /api/roles/delete/{id}`

**Mô tả:** Xóa một vai trò theo ID.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Role cần xóa |

**Request Example:**
```
DELETE http://localhost:8002/api/roles/delete/7
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "success",
  "statusCode": 200
}
```

---

### 2.6. Xóa nhiều Roles

**Endpoint:** `POST /api/roles/delete`

**Mô tả:** Xóa nhiều vai trò cùng lúc.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| ids | List<Long> | Có | Danh sách ID cần xóa |

**Request Example:**
```
POST http://localhost:8002/api/roles/delete?ids=7,8,9
```

**Response:** Giống như API 2.5

---

### 2.7. Copy Role

**Endpoint:** `POST /api/roles/copy/{id}`

**Mô tả:** Sao chép một vai trò.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Role cần copy |

**Request Example:**
```
POST http://localhost:8002/api/roles/copy/1
```

**Response:** Giống như API 2.3 (có thêm timestamp trong tên)

---

### 2.8. Export Roles

**Endpoint:** `GET /api/roles/export`

**Mô tả:** Xuất danh sách Roles ra file Excel.

**Request Example:**
```
GET http://localhost:8002/api/roles/export
```

**Response:** File Excel (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

### 2.9. Import Roles

**Endpoint:** `POST /api/roles/import`

**Mô tả:** Nhập dữ liệu Roles từ file Excel/CSV/TXT.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data với key `file` chứa file upload

**Request Example:**
```
POST http://localhost:8002/api/roles/import
Content-Type: multipart/form-data

file: [Excel/CSV/TXT file]
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "name": "Imported Role",
      "description": "Role từ import",
      "displayOrder": 10,
      "isActive": true,
      "createdAt": "2025-11-16T10:00:00Z",
      "updatedAt": "2025-11-16T10:00:00Z"
    }
  ],
  "message": "Imported 1 roles successfully",
  "statusCode": 200
}
```

---

### 2.10. Download Template

**Endpoint:** `GET /api/roles/template`

**Mô tả:** Tải file Excel mẫu để import.

**Request Example:**
```
GET http://localhost:8002/api/roles/template
```

**Response:** File Excel template

---

## 3. Alert Frequency Management (Quản lý Tần suất Cảnh báo)

### 3.1. Lấy danh sách Alert Frequency

**Endpoint:** `GET /api/alert_frequency/`

**Mô tả:** Lấy danh sách cấu hình tần suất cảnh báo với phân trang, sắp xếp và tìm kiếm.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số bản ghi trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong alert_status_id, repeat_count, interval_minutes) |
| sortDir | String | Không | desc | Hướng sắp xếp (asc/desc) |
| sortKey | String | Không | id | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/alert_frequency/?page=1&limit=10&sortDir=desc&sortKey=id&keyword=10
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "alertStatusId": 1,
        "repeatCount": 3,
        "intervalMinutes": 10,
        "isActive": true,
        "createdAt": "2025-11-16T03:00:00Z",
        "updatedAt": "2025-11-16T03:00:00Z"
      }
    ],
    "total": 1,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 3.2. Filter Alert Frequency (Lọc nâng cao)

**Endpoint:** `GET /api/alert_frequency/filter`

**Mô tả:** Lọc cấu hình tần suất cảnh báo theo các tiêu chí nâng cao.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số bản ghi/trang |
| alertStatusId | Integer | Không | - | Lọc theo alert status ID |
| repeatCount | Integer | Không | - | Lọc theo số lần lặp |
| intervalMinutes | Integer | Không | - | Lọc theo khoảng thời gian (phút) |
| isActive | Boolean | Không | - | Lọc theo trạng thái (true/false) |
| sortDir | String | Không | desc | Hướng sắp xếp |
| sortKey | String | Không | id | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/alert_frequency/filter?page=1&limit=10&alertStatusId=1&isActive=true&sortDir=desc&sortKey=id
```

**Response:** Giống như API 3.1

---

### 3.3. Tạo mới Alert Frequency

**Endpoint:** `POST /api/alert_frequency/create`

**Mô tả:** Tạo mới một cấu hình tần suất cảnh báo.

**Request Body:**
```json
{
  "alertStatusId": 4,
  "repeatCount": 5,
  "intervalMinutes": 15,
  "isActive": true
}
```

**Lưu ý:**
- `repeatCount`: NULL hoặc không truyền = lặp vô hạn
- `intervalMinutes`: Bắt buộc (khoảng thời gian giữa các lần nhắc, đơn vị phút)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "alertStatusId": 4,
    "repeatCount": 5,
    "intervalMinutes": 15,
    "isActive": true,
    "createdAt": "2025-11-16T10:00:00Z",
    "updatedAt": "2025-11-16T10:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 3.4. Cập nhật Alert Frequency

**Endpoint:** `POST /api/alert_frequency/edit`

**Mô tả:** Cập nhật thông tin cấu hình tần suất cảnh báo.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Alert Frequency cần cập nhật |

**Request Body:**
```json
{
  "alertStatusId": 4,
  "repeatCount": 10,
  "intervalMinutes": 20,
  "isActive": true
}
```

**Request Example:**
```
POST http://localhost:8002/api/alert_frequency/edit?id=4
```

**Response:** Giống như API 3.3

---

### 3.5. Xóa Alert Frequency (đơn)

**Endpoint:** `DELETE /api/alert_frequency/delete/{id}`

**Mô tả:** Xóa một cấu hình tần suất cảnh báo theo ID.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Alert Frequency cần xóa |

**Request Example:**
```
DELETE http://localhost:8002/api/alert_frequency/delete/4
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "success",
  "statusCode": 200
}
```

---

### 3.6. Xóa nhiều Alert Frequency

**Endpoint:** `POST /api/alert_frequency/delete`

**Mô tả:** Xóa nhiều cấu hình tần suất cảnh báo cùng lúc.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| ids | List<Long> | Có | Danh sách ID cần xóa |

**Request Example:**
```
POST http://localhost:8002/api/alert_frequency/delete?ids=4,5,6
```

**Response:** Giống như API 3.5

---

### 3.7. Copy Alert Frequency

**Endpoint:** `POST /api/alert_frequency/copy/{id}`

**Mô tả:** Sao chép một cấu hình tần suất cảnh báo với alert status ID mới.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Alert Frequency cần copy |

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| newAlertStatusId | Integer | Có | Alert status ID mới cho bản sao |

**Request Example:**
```
POST http://localhost:8002/api/alert_frequency/copy/1?newAlertStatusId=5
```

**Lưu ý:**
- Phải cung cấp `newAlertStatusId` vì mỗi alert status chỉ có 1 cấu hình duy nhất
- `newAlertStatusId` phải chưa tồn tại trong hệ thống

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "alertStatusId": 5,
    "repeatCount": 3,
    "intervalMinutes": 10,
    "isActive": true,
    "createdAt": "2025-11-16T10:00:00Z",
    "updatedAt": "2025-11-16T10:00:00Z"
  },
  "message": "Alert frequency copied successfully",
  "statusCode": 200
}
```

---

### 3.8. Export Alert Frequency

**Endpoint:** `GET /api/alert_frequency/export`

**Mô tả:** Xuất danh sách Alert Frequency ra file Excel.

**Request Example:**
```
GET http://localhost:8002/api/alert_frequency/export
```

**Response:** File Excel (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

### 3.9. Import Alert Frequency

**Endpoint:** `POST /api/alert_frequency/import`

**Mô tả:** Nhập dữ liệu Alert Frequency từ file Excel/CSV/TXT.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data với key `file` chứa file upload

**Request Example:**
```
POST http://localhost:8002/api/alert_frequency/import
Content-Type: multipart/form-data

file: [Excel/CSV/TXT file]
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "alertStatusId": 7,
      "repeatCount": 3,
      "intervalMinutes": 10,
      "isActive": true,
      "createdAt": "2025-11-16T10:00:00Z",
      "updatedAt": "2025-11-16T10:00:00Z"
    }
  ],
  "message": "Imported 1 alert frequencies successfully",
  "statusCode": 200
}
```

---

### 3.10. Download Template

**Endpoint:** `GET /api/alert_frequency/template`

**Mô tả:** Tải file Excel mẫu để import.

**Request Example:**
```
GET http://localhost:8002/api/alert_frequency/template
```

**Response:** File Excel template

---

## 4. Operation Type Management (Quản lý Loại vận hành)

### 4.1. Lấy danh sách Operation Type

**Endpoint:** `GET /api/operation-type/`

**Mô tả:** Lấy danh sách loại vận hành với phân trang, sắp xếp và tìm kiếm.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số bản ghi trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong code, name, description, note) |
| sortDir | String | Không | desc | Hướng sắp xếp (asc/desc) |
| sortKey | String | Không | createdAt | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/operation-type/?page=1&limit=10&sortDir=desc&sortKey=createdAt&keyword=OS
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "operationTypeCode": "OS",
        "operationTypeName": "Hệ điều hành",
        "description": "Quản lý các loại hệ điều hành",
        "note": "Ghi chú",
        "createdAt": "2025-11-16T03:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2025-11-16T03:00:00Z",
        "updatedBy": "admin"
      }
    ],
    "total": 1,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 4.2. Filter Operation Type (Lọc nâng cao)

**Endpoint:** `GET /api/operation-type/filter`

**Mô tả:** Lọc loại vận hành theo các tiêu chí nâng cao.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang |
| limit | Integer | Không | 10 | Số bản ghi/trang |
| code | String | Không | - | Lọc theo mã loại vận hành |
| name | String | Không | - | Lọc theo tên loại vận hành |
| description | String | Không | - | Lọc theo mô tả |
| note | String | Không | - | Lọc theo ghi chú |
| sortDir | String | Không | desc | Hướng sắp xếp |
| sortKey | String | Không | createdAt | Trường sắp xếp |

**Request Example:**
```
GET http://localhost:8002/api/operation-type/filter?page=1&limit=10&code=OS&sortDir=desc&sortKey=createdAt
```

**Response:** Giống như API 4.1

---

### 4.3. Lấy Operation Type theo ID

**Endpoint:** `GET /api/operation-type/{id}`

**Mô tả:** Lấy thông tin chi tiết một loại vận hành theo ID.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Operation Type |

**Request Example:**
```
GET http://localhost:8002/api/operation-type/1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "operationTypeCode": "OS",
    "operationTypeName": "Hệ điều hành",
    "description": "Quản lý các loại hệ điều hành",
    "note": "Ghi chú",
    "createdAt": "2025-11-16T03:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2025-11-16T03:00:00Z",
    "updatedBy": "admin"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 4.4. Tạo mới Operation Type

**Endpoint:** `POST /api/operation-type/create`

**Mô tả:** Tạo mới một loại vận hành.

**Request Body:**
```json
{
  "operationTypeCode": "APP",
  "operationTypeName": "Ứng dụng",
  "description": "Quản lý các loại ứng dụng",
  "note": "Ghi chú thêm",
  "createdBy": "admin"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "operationTypeCode": "APP",
    "operationTypeName": "Ứng dụng",
    "description": "Quản lý các loại ứng dụng",
    "note": "Ghi chú thêm",
    "createdAt": "2025-11-16T10:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2025-11-16T10:00:00Z",
    "updatedBy": null
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 4.5. Cập nhật Operation Type

**Endpoint:** `POST /api/operation-type/edit`

**Mô tả:** Cập nhật thông tin loại vận hành.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Operation Type cần cập nhật |

**Request Body:**
```json
{
  "operationTypeCode": "APP",
  "operationTypeName": "Ứng dụng hệ thống",
  "description": "Quản lý các loại ứng dụng hệ thống",
  "note": "Đã cập nhật",
  "updatedBy": "admin"
}
```

**Request Example:**
```
POST http://localhost:8002/api/operation-type/edit?id=2
```

**Response:** Giống như API 4.4

---

### 4.6. Xóa Operation Type (đơn)

**Endpoint:** `DELETE /api/operation-type/delete/{id}`

**Mô tả:** Xóa một loại vận hành theo ID.

**Path Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Operation Type cần xóa |

**Request Example:**
```
DELETE http://localhost:8002/api/operation-type/delete/2
```

**Response Example:**
```json
{
  "success": true,
  "data": null,
  "message": "success",
  "statusCode": 200
}
```

---

### 4.7. Xóa nhiều Operation Type

**Endpoint:** `POST /api/operation-type/delete`

**Mô tả:** Xóa nhiều loại vận hành cùng lúc.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| ids | List<Long> | Có | Danh sách ID cần xóa |

**Request Example:**
```
POST http://localhost:8002/api/operation-type/delete?ids=2,3,4
```

**Response:** Giống như API 4.6

---

### 4.8. Copy Operation Type

**Endpoint:** `POST /api/operation-type/copy`

**Mô tả:** Sao chép một loại vận hành.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | Long | Có | ID của Operation Type cần copy |

**Request Body:**
```json
{
  "operationTypeCode": "APP_COPY",
  "operationTypeName": "Ứng dụng (Copy)",
  "description": "Quản lý các loại ứng dụng",
  "note": "Sao chép từ APP",
  "createdBy": "admin"
}
```

**Request Example:**
```
POST http://localhost:8002/api/operation-type/copy?id=1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "operationTypeCode": "APP_COPY",
    "operationTypeName": "Ứng dụng (Copy)",
    "description": "Quản lý các loại ứng dụng",
    "note": "Sao chép từ APP",
    "createdAt": "2025-11-16T10:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2025-11-16T10:00:00Z",
    "updatedBy": null
  },
  "message": "Operation type copied successfully",
  "statusCode": 200
}
```

---

### 4.9. Export Operation Type

**Endpoint:** `GET /api/operation-type/export`

**Mô tả:** Xuất danh sách Operation Type ra file Excel.

**Request Example:**
```
GET http://localhost:8002/api/operation-type/export
```

**Response:** File Excel (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Các cột trong file Excel:**
- Mã loại vận hành
- Tên loại vận hành
- Mô tả
- Ghi chú
- Người tạo
- Thời gian tạo
- Người cập nhật
- Thời gian cập nhật

---

### 4.10. Import Operation Type

**Endpoint:** `POST /api/operation-type/import`

**Mô tả:** Nhập dữ liệu Operation Type từ file Excel.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data với key `file` chứa file upload

**Request Example:**
```
POST http://localhost:8002/api/operation-type/import
Content-Type: multipart/form-data

file: [Excel file]
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "operationTypeCode": "DB",
      "operationTypeName": "Cơ sở dữ liệu",
      "description": "Quản lý các loại cơ sở dữ liệu",
      "note": "Import từ Excel",
      "createdAt": "2025-11-16T10:00:00Z",
      "createdBy": "admin",
      "updatedAt": "2025-11-16T10:00:00Z",
      "updatedBy": null
    }
  ],
  "message": "Imported 1 operation type(s) successfully",
  "statusCode": 200
}
```

---

### 4.11. Download Template

**Endpoint:** `GET /api/operation-type/template`

**Mô tả:** Tải file Excel mẫu để import.

**Request Example:**
```
GET http://localhost:8002/api/operation-type/template
```

**Response:** File Excel template

**Các cột trong template:**
- Mã loại vận hành* (bắt buộc)
- Tên loại vận hành* (bắt buộc)
- Mô tả
- Ghi chú
- Người tạo

---

## Common Response Structure

Tất cả các API đều trả về theo cấu trúc chung:

```json
{
  "success": true/false,
  "data": <object hoặc array>,
  "message": "success" hoặc thông báo lỗi,
  "statusCode": 200/400/404/500
}
```

### Error Response Example:

```json
{
  "success": false,
  "data": null,
  "message": "An error occurred: ...",
  "statusCode": 500
}
```

---

## Lưu ý quan trọng

1. **Tên tham số (đã thống nhất):**
   - **Tất cả các module:** Sử dụng `keyword` (chữ thường) và `sortDir`, `sortKey` (camelCase)

2. **Phân trang:**
   - `page` bắt đầu từ 1 (không phải 0)
   - Response trả về `page` index từ 0

3. **File upload:**
   - Sử dụng `multipart/form-data`
   - Key của file phải là `file`

4. **Boolean values:**
   - Truyền `true` hoặc `false` (không có dấu ngoặc kép)
   - URL encode khi cần: `isActive=true`

5. **List parameters:**
   - Truyền dưới dạng comma-separated: `ids=1,2,3`

6. **Null values:**
   - Để trống hoặc không truyền parameter nếu muốn NULL
   - Trong JSON body: `"repeatCount": null`
