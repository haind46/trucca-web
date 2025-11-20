# API Documentation - Quản lý Lịch Trực Ca

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [API Quản lý Ca trực (Shifts)](#api-quản-lý-ca-trực-shifts)
3. [API Quản lý Lịch trực ca (Schedule)](#api-quản-lý-lịch-trực-ca-schedule)
4. [API Gán người vào ca (Schedule Assignments)](#api-gán-người-vào-ca-schedule-assignments)

---

## Tổng quan

Base URL: `http://localhost:8002`

Tất cả API đều trả về response theo format:
```json
{
  "success": true,
  "data": {},
  "message": "success",
  "statusCode": 200
}
```

### Cấu trúc Response cho API có phân trang

**LƯU Ý QUAN TRỌNG:** Tất cả API có phân trang trả về cấu trúc:
```json
{
  "success": true,
  "data": {
    "data": [...],        // Mảng dữ liệu (KHÔNG phải "content")
    "total": 12,          // Tổng số items (KHÔNG phải "totalElements")
    "page": 0,            // Số trang hiện tại (0-indexed)
    "size": 10            // Số items mỗi trang
  },
  "message": "success",
  "statusCode": 200
}
```

**KHÁC BIỆT với Spring Boot pagination mặc định:**
- Backend sử dụng `data.data` thay vì `data.content`
- Backend sử dụng `total` thay vì `totalElements`
- Backend KHÔNG trả về `totalPages` - cần tính bằng: `Math.ceil(total / size)`
- Backend sử dụng `page` (0-indexed)

### Giải thích các trường dữ liệu quan trọng

**Shifts (Ca trực):**
- `shiftName`: Tên ca trực (VD: "Ca Ngày", "Ca Đêm", "Ca Chiều")
- `startTime`: Giờ bắt đầu ca (format: HH:mm, VD: "08:00")
- `endTime`: Giờ kết thúc ca (format: HH:mm, VD: "17:00")
- `isActive`: Trạng thái hoạt động (true/false)

**Schedule (Lịch trực):**
- `fromDate`: Ngày bắt đầu lịch trực (format: yyyy-MM-dd, VD: "2025-11-20")
- `toDate`: Ngày kết thúc lịch trực (có thể null nếu chỉ 1 ngày, format: yyyy-MM-dd)
- `shiftId`: ID của ca trực được gán
- `status`: Trạng thái lịch trực
  - `pending`: Chờ xác nhận
  - `active`: Đang hoạt động
  - `completed`: Đã hoàn thành
  - `cancelled`: Đã hủy
  - `updated`: Đã cập nhật
- `note`: Ghi chú thêm về lịch trực

**Schedule Assignments (Gán người vào ca):**
- `scheduleId`: ID của lịch trực
- `contactId`: ID của người được gán vào ca
- `role`: Vai trò trong ca trực
  - `primary`: Trực chính
  - `backup`: Trực dự phòng
  - `viewer`: Người xem/giám sát
- `status`: Trạng thái phân công
  - `assigned`: Đã phân công
  - `checked_in`: Đã checkin
  - `checked_out`: Đã checkout
  - `absent`: Vắng mặt
  - `replaced`: Đã được thay thế

---

## API Quản lý Ca trực (Shifts)

### 1. Lấy danh sách tất cả Shifts

**Endpoint:** `GET /api/shifts`

**Mô tả:** Lấy danh sách ca trực với phân trang, tìm kiếm và sắp xếp

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang (bắt đầu từ 1)
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `keyword` (string, optional): Từ khóa tìm kiếm (tìm trong tên ca, mô tả)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/shifts?page=1&limit=10&keyword=Ngày&sortDir=desc&sortKey=id
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "shiftName": "Ca Ngày",
        "startTime": "08:00",
        "endTime": "17:00",
        "description": "Ca trực ban ngày",
        "isActive": true,
        "createdAt": "2025-11-19T03:00:00Z",
        "updatedAt": "2025-11-19T03:00:00Z"
      },
      {
        "id": 2,
        "shiftName": "Ca Ngày - Phụ",
        "startTime": "09:00",
        "endTime": "18:00",
        "description": "Ca trực ban ngày - ca phụ",
        "isActive": true,
        "createdAt": "2025-11-19T04:00:00Z",
        "updatedAt": "2025-11-19T04:00:00Z"
      }
    ],
    "total": 2,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 2. Tìm kiếm Shifts với bộ lọc nâng cao

**Endpoint:** `GET /api/shifts/filter`

**Mô tả:** Tìm kiếm ca trực với các tiêu chí lọc chi tiết

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `shiftName` (string, optional): Lọc theo tên ca trực
- `description` (string, optional): Lọc theo mô tả
- `isActive` (boolean, optional): Lọc theo trạng thái (true/false)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/shifts/filter?page=1&limit=10&shiftName=Ca&isActive=true&sortDir=asc&sortKey=startTime
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "shiftName": "Ca Ngày",
        "startTime": "08:00",
        "endTime": "17:00",
        "description": "Ca trực ban ngày",
        "isActive": true,
        "createdAt": "2025-11-19T03:00:00Z",
        "updatedAt": "2025-11-19T03:00:00Z"
      },
      {
        "id": 3,
        "shiftName": "Ca Chiều",
        "startTime": "13:00",
        "endTime": "22:00",
        "description": "Ca trực buổi chiều tối",
        "isActive": true,
        "createdAt": "2025-11-19T05:00:00Z",
        "updatedAt": "2025-11-19T05:00:00Z"
      },
      {
        "id": 4,
        "shiftName": "Ca Đêm",
        "startTime": "22:00",
        "endTime": "08:00",
        "description": "Ca trực ban đêm (qua đêm)",
        "isActive": true,
        "createdAt": "2025-11-19T06:00:00Z",
        "updatedAt": "2025-11-19T06:00:00Z"
      }
    ],
    "total": 3,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

**Lưu ý:** Ca qua đêm (startTime > endTime) như Ca Đêm 22:00-08:00 sẽ bắt đầu vào buổi tối và kết thúc sáng hôm sau.

---

### 3. Thêm mới Shift

**Endpoint:** `POST /api/shifts/create`

**Mô tả:** Tạo mới một ca trực

**Request Body:**
```json
{
  "shiftName": "Ca Sáng",
  "startTime": "06:00",
  "endTime": "14:00",
  "description": "Ca trực buổi sáng",
  "isActive": true
}
```

**Giải thích các trường:**
- `shiftName` (string, required): Tên ca trực, tối đa 100 ký tự
- `startTime` (string, required): Giờ bắt đầu, format HH:mm (24h)
- `endTime` (string, required): Giờ kết thúc, format HH:mm (24h)
- `description` (string, optional): Mô tả chi tiết về ca trực
- `isActive` (boolean, optional, default: true): Trạng thái hoạt động

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "shiftName": "Ca Sáng",
    "startTime": "06:00",
    "endTime": "14:00",
    "description": "Ca trực buổi sáng",
    "isActive": true,
    "createdAt": "2025-11-19T10:00:00Z",
    "updatedAt": "2025-11-19T10:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 4. Sửa Shift

**Endpoint:** `POST /api/shifts/edit?id={id}`

**Mô tả:** Cập nhật thông tin ca trực

**Query Parameters:**
- `id` (long, required): ID của shift cần sửa

**Request Body:**
```json
{
  "shiftName": "Ca Sáng - Updated",
  "startTime": "06:30",
  "endTime": "14:30",
  "description": "Ca trực buổi sáng - Đã cập nhật giờ",
  "isActive": true
}
```

**Request Example:**
```
POST http://localhost:8002/api/shifts/edit?id=5
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "shiftName": "Ca Sáng - Updated",
    "startTime": "06:30",
    "endTime": "14:30",
    "description": "Ca trực buổi sáng - Đã cập nhật giờ",
    "isActive": true,
    "createdAt": "2025-11-19T10:00:00Z",
    "updatedAt": "2025-11-19T11:30:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 5. Xóa Shift (đơn)

**Endpoint:** `DELETE /api/shifts/delete/{id}`

**Mô tả:** Xóa một ca trực theo ID

**Path Parameters:**
- `id` (long, required): ID của shift cần xóa

**Request Example:**
```
DELETE http://localhost:8002/api/shifts/delete/5
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

**Lưu ý:** Nếu shift đang được sử dụng trong schedule, việc xóa có thể ảnh hưởng đến dữ liệu liên quan.

---

### 6. Xóa nhiều Shifts

**Endpoint:** `POST /api/shifts/delete?ids={ids}`

**Mô tả:** Xóa nhiều ca trực theo danh sách IDs

**Query Parameters:**
- `ids` (array of long, required): Danh sách ID các shifts cần xóa (phân cách bằng dấu phẩy)

**Request Example:**
```
POST http://localhost:8002/api/shifts/delete?ids=5,6,7
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

### 7. Sao chép Shift

**Endpoint:** `POST /api/shifts/copy/{id}`

**Mô tả:** Tạo bản sao của một ca trực

**Path Parameters:**
- `id` (long, required): ID của shift cần sao chép

**Request Example:**
```
POST http://localhost:8002/api/shifts/copy/1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "shiftName": "Ca Ngày (Copy 1732012800000)",
    "startTime": "08:00",
    "endTime": "17:00",
    "description": "Ca trực ban ngày",
    "isActive": true,
    "createdAt": "2025-11-19T12:00:00Z",
    "updatedAt": "2025-11-19T12:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

**Lưu ý:** Hệ thống tự động thêm timestamp vào tên shift để tránh trùng lặp.

---

### 8. Export Shifts ra file Excel

**Endpoint:** `GET /api/shifts/export`

**Mô tả:** Export tất cả shifts ra file Excel (.xlsx)

**Request Example:**
```
GET http://localhost:8002/api/shifts/export
```

**Response:** File Excel được download với tên `shifts_export.xlsx`

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Các cột trong file Excel:**
- ID
- Shift Name
- Start Time (HH:mm)
- End Time (HH:mm)
- Description
- Is Active
- Created At
- Updated At

---

### 9. Import Shifts từ file

**Endpoint:** `POST /api/shifts/import`

**Mô tả:** Import shifts từ file Excel (.xlsx, .xls), CSV, hoặc TXT

**Request:** Multipart form-data

**Form Data:**
- `file` (file, required): File chứa dữ liệu shifts

**Request Example (sử dụng curl):**
```bash
curl -X POST http://localhost:8002/api/shifts/import \
  -F "file=@shifts.xlsx"
```

**Request Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8002/api/shifts/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "shiftName": "Ca 24h",
      "startTime": "00:00",
      "endTime": "23:59",
      "description": "Ca trực 24 giờ",
      "isActive": true,
      "createdAt": "2025-11-19T13:00:00Z",
      "updatedAt": "2025-11-19T13:00:00Z"
    },
    {
      "id": 10,
      "shiftName": "Ca Hành Chính",
      "startTime": "08:00",
      "endTime": "17:00",
      "description": "Ca hành chính",
      "isActive": true,
      "createdAt": "2025-11-19T13:00:01Z",
      "updatedAt": "2025-11-19T13:00:01Z"
    }
  ],
  "message": "Imported 2 shifts successfully",
  "statusCode": 200
}
```

**Hướng dẫn import:**
1. Tải file template mẫu từ endpoint `/api/shifts/template`
2. Điền dữ liệu vào file theo đúng format
3. Upload file qua API này
4. File Excel phải có các cột: Shift Name, Start Time, End Time, Description, Is Active

**Lưu ý quan trọng khi import:**
- Cột "ID" để trống khi thêm mới
- Thời gian phải đúng format HH:mm (VD: 08:00, 17:30)
- Is Active: true hoặc false
- File .csv phải có encoding UTF-8
- Dữ liệu trùng lặp sẽ bị bỏ qua

---

## API Quản lý Lịch trực ca (Schedule)

### 1. Lấy danh sách tất cả Schedules

**Endpoint:** `GET /api/schedule`

**Mô tả:** Lấy danh sách lịch trực với phân trang, tìm kiếm và sắp xếp

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang (bắt đầu từ 1)
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `keyword` (string, optional): Từ khóa tìm kiếm (tìm trong status, note)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/schedule?page=1&limit=10&keyword=pending&sortDir=desc&sortKey=fromDate
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "fromDate": "2025-11-20",
        "toDate": "2025-11-22",
        "shiftId": 1,
        "shift": {
          "id": 1,
          "shiftName": "Ca Ngày",
          "startTime": "08:00",
          "endTime": "17:00",
          "description": "Ca trực ban ngày",
          "isActive": true
        },
        "status": "pending",
        "note": "Lịch trực 3 ngày liên tục",
        "createdAt": "2025-11-19T08:00:00Z",
        "updatedAt": "2025-11-19T08:00:00Z"
      },
      {
        "id": 2,
        "fromDate": "2025-11-23",
        "toDate": null,
        "shiftId": 3,
        "shift": {
          "id": 3,
          "shiftName": "Ca Chiều",
          "startTime": "13:00",
          "endTime": "22:00",
          "description": "Ca trực buổi chiều tối",
          "isActive": true
        },
        "status": "active",
        "note": "Trực 1 ngày",
        "createdAt": "2025-11-19T09:00:00Z",
        "updatedAt": "2025-11-19T09:00:00Z"
      }
    ],
    "total": 2,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

**Lưu ý:**
- Khi `toDate` là null, lịch trực chỉ áp dụng cho 1 ngày (fromDate)
- Response bao gồm cả thông tin shift liên quan

---

### 2. Tìm kiếm Schedules với bộ lọc nâng cao

**Endpoint:** `GET /api/schedule/filter`

**Mô tả:** Tìm kiếm lịch trực với các tiêu chí lọc chi tiết

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `fromDate` (string, optional): Lọc theo ngày bắt đầu (yyyy-MM-dd)
- `toDate` (string, optional): Lọc theo ngày kết thúc (yyyy-MM-dd)
- `shiftId` (long, optional): Lọc theo ID ca trực
- `status` (string, optional): Lọc theo trạng thái (pending/active/completed/cancelled/updated)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/schedule/filter?page=1&limit=10&fromDate=2025-11-20&toDate=2025-11-30&shiftId=1&status=active&sortDir=asc&sortKey=fromDate
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 3,
        "fromDate": "2025-11-25",
        "toDate": "2025-11-27",
        "shiftId": 1,
        "shift": {
          "id": 1,
          "shiftName": "Ca Ngày",
          "startTime": "08:00",
          "endTime": "17:00",
          "description": "Ca trực ban ngày",
          "isActive": true
        },
        "status": "active",
        "note": "Lịch trực cuối tuần",
        "createdAt": "2025-11-19T10:00:00Z",
        "updatedAt": "2025-11-19T10:00:00Z"
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

**Giải thích filter parameters:**
- `fromDate` và `toDate`: Lọc các lịch trực trong khoảng thời gian
- `shiftId`: Lọc các lịch trực của một ca cụ thể
- `status`: Lọc theo trạng thái (pending: chờ xác nhận, active: đang hoạt động, completed: đã hoàn thành, cancelled: đã hủy, updated: đã cập nhật)

---

### 3. Thêm mới Schedule

**Endpoint:** `POST /api/schedule/create`

**Mô tả:** Tạo mới một lịch trực

**Request Body:**
```json
{
  "fromDate": "2025-11-20",
  "toDate": "2025-11-23",
  "shiftId": 1,
  "status": "pending",
  "note": "Lịch trực 4 ngày cho Ca Ngày"
}
```

**Giải thích các trường:**
- `fromDate` (string, required): Ngày bắt đầu, format yyyy-MM-dd
- `toDate` (string, optional): Ngày kết thúc, format yyyy-MM-dd (null nếu chỉ 1 ngày)
- `shiftId` (long, required): ID của ca trực được gán
- `status` (string, optional, default: "pending"): Trạng thái lịch trực
  - pending: Chờ xác nhận
  - active: Đang hoạt động
  - completed: Đã hoàn thành
  - cancelled: Đã hủy
  - updated: Đã cập nhật
- `note` (string, optional): Ghi chú thêm

**Request Example (lịch trực 1 ngày):**
```json
{
  "fromDate": "2025-11-25",
  "toDate": null,
  "shiftId": 3,
  "status": "active",
  "note": "Trực 1 ngày Ca Chiều"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "fromDate": "2025-11-20",
    "toDate": "2025-11-23",
    "shiftId": 1,
    "shift": {
      "id": 1,
      "shiftName": "Ca Ngày",
      "startTime": "08:00",
      "endTime": "17:00",
      "description": "Ca trực ban ngày",
      "isActive": true
    },
    "status": "pending",
    "note": "Lịch trực 4 ngày cho Ca Ngày",
    "createdAt": "2025-11-19T14:00:00Z",
    "updatedAt": "2025-11-19T14:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 4. Sửa Schedule

**Endpoint:** `POST /api/schedule/edit?id={id}`

**Mô tả:** Cập nhật thông tin lịch trực

**Query Parameters:**
- `id` (long, required): ID của schedule cần sửa

**Request Body:**
```json
{
  "fromDate": "2025-11-20",
  "toDate": "2025-11-24",
  "shiftId": 1,
  "status": "updated",
  "note": "Lịch trực 5 ngày cho Ca Ngày - Đã gia hạn thêm 1 ngày"
}
```

**Request Example:**
```
POST http://localhost:8002/api/schedule/edit?id=4
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "fromDate": "2025-11-20",
    "toDate": "2025-11-24",
    "shiftId": 1,
    "shift": {
      "id": 1,
      "shiftName": "Ca Ngày",
      "startTime": "08:00",
      "endTime": "17:00",
      "description": "Ca trực ban ngày",
      "isActive": true
    },
    "status": "updated",
    "note": "Lịch trực 5 ngày cho Ca Ngày - Đã gia hạn thêm 1 ngày",
    "createdAt": "2025-11-19T14:00:00Z",
    "updatedAt": "2025-11-19T15:30:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 5. Xóa Schedule (đơn)

**Endpoint:** `DELETE /api/schedule/delete/{id}`

**Mô tả:** Xóa một lịch trực theo ID

**Path Parameters:**
- `id` (long, required): ID của schedule cần xóa

**Request Example:**
```
DELETE http://localhost:8002/api/schedule/delete/4
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

**Lưu ý:** Xóa schedule sẽ ảnh hưởng đến các schedule assignments liên quan.

---

### 6. Xóa nhiều Schedules

**Endpoint:** `POST /api/schedule/delete?ids={ids}`

**Mô tả:** Xóa nhiều lịch trực theo danh sách IDs

**Query Parameters:**
- `ids` (array of long, required): Danh sách ID các schedules cần xóa (phân cách bằng dấu phẩy)

**Request Example:**
```
POST http://localhost:8002/api/schedule/delete?ids=4,5,6
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

### 7. Sao chép Schedule

**Endpoint:** `POST /api/schedule/copy/{id}`

**Mô tả:** Tạo bản sao của một lịch trực

**Path Parameters:**
- `id` (long, required): ID của schedule cần sao chép

**Request Example:**
```
POST http://localhost:8002/api/schedule/copy/1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "fromDate": "2025-11-20",
    "toDate": "2025-11-22",
    "shiftId": 1,
    "shift": {
      "id": 1,
      "shiftName": "Ca Ngày",
      "startTime": "08:00",
      "endTime": "17:00",
      "description": "Ca trực ban ngày",
      "isActive": true
    },
    "status": "pending",
    "note": "Lịch trực 3 ngày liên tục (Copy)",
    "createdAt": "2025-11-19T16:00:00Z",
    "updatedAt": "2025-11-19T16:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

**Lưu ý:** Bản sao sẽ có status mặc định là "pending" và không copy các schedule assignments.

---

### 8. Export Schedules ra file Excel

**Endpoint:** `GET /api/schedule/export`

**Mô tả:** Export tất cả schedules ra file Excel (.xlsx)

**Request Example:**
```
GET http://localhost:8002/api/schedule/export
```

**Response:** File Excel được download với tên `schedules_export.xlsx`

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Các cột trong file Excel:**
- ID
- From Date (yyyy-MM-dd)
- To Date (yyyy-MM-dd)
- Shift ID
- Shift Name
- Status
- Note
- Created At
- Updated At

---

### 9. Import Schedules từ file

**Endpoint:** `POST /api/schedule/import`

**Mô tả:** Import schedules từ file Excel (.xlsx, .xls), CSV, hoặc TXT

**Request:** Multipart form-data

**Form Data:**
- `file` (file, required): File chứa dữ liệu schedules

**Request Example (sử dụng curl):**
```bash
curl -X POST http://localhost:8002/api/schedule/import \
  -F "file=@schedules.xlsx"
```

**Request Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8002/api/schedule/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "fromDate": "2025-12-01",
      "toDate": "2025-12-05",
      "shiftId": 1,
      "shift": {
        "id": 1,
        "shiftName": "Ca Ngày",
        "startTime": "08:00",
        "endTime": "17:00",
        "description": "Ca trực ban ngày",
        "isActive": true
      },
      "status": "pending",
      "note": "Lịch trực tháng 12",
      "createdAt": "2025-11-19T17:00:00Z",
      "updatedAt": "2025-11-19T17:00:00Z"
    },
    {
      "id": 9,
      "fromDate": "2025-12-06",
      "toDate": "2025-12-10",
      "shiftId": 3,
      "shift": {
        "id": 3,
        "shiftName": "Ca Chiều",
        "startTime": "13:00",
        "endTime": "22:00",
        "description": "Ca trực buổi chiều tối",
        "isActive": true
      },
      "status": "pending",
      "note": "Lịch trực tuần 2 tháng 12",
      "createdAt": "2025-11-19T17:00:01Z",
      "updatedAt": "2025-11-19T17:00:01Z"
    }
  ],
  "message": "Imported 2 schedules successfully",
  "statusCode": 200
}
```

**Hướng dẫn import:**
1. Tải file template mẫu từ endpoint `/api/schedule/template`
2. Điền dữ liệu vào file theo đúng format
3. Upload file qua API này
4. File Excel phải có các cột: From Date, To Date, Shift ID, Status, Note

**Lưu ý quan trọng khi import:**
- Cột "ID" để trống khi thêm mới
- Ngày phải đúng format yyyy-MM-dd (VD: 2025-11-20)
- To Date có thể để trống (null) nếu chỉ 1 ngày
- Shift ID phải tồn tại trong hệ thống
- Status: pending, active, completed, cancelled, hoặc updated
- fromDate không được lớn hơn toDate

---

## API Gán người vào ca (Schedule Assignments)

### 1. Lấy danh sách tất cả Schedule Assignments

**Endpoint:** `GET /api/schedule_assignments`

**Mô tả:** Lấy danh sách phân công ca trực với phân trang, tìm kiếm và sắp xếp

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang (bắt đầu từ 1)
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `keyword` (string, optional): Từ khóa tìm kiếm (tìm trong role, status)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp (asc/desc)
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/schedule_assignments?page=1&limit=10&keyword=primary&sortDir=desc&sortKey=id
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "scheduleId": 1,
        "schedule": {
          "id": 1,
          "fromDate": "2025-11-20",
          "toDate": "2025-11-22",
          "shiftId": 1,
          "shift": {
            "id": 1,
            "shiftName": "Ca Ngày",
            "startTime": "08:00",
            "endTime": "17:00"
          },
          "status": "pending",
          "note": "Lịch trực 3 ngày liên tục"
        },
        "contactId": 101,
        "contact": {
          "id": 101,
          "fullName": "Nguyễn Văn A",
          "departmentId": 1,
          "email": "nguyenvana@company.com",
          "phone": "0901234567",
          "isActive": true
        },
        "role": "primary",
        "status": "assigned",
        "createdAt": "2025-11-19T08:30:00Z"
      },
      {
        "id": 2,
        "scheduleId": 1,
        "schedule": {
          "id": 1,
          "fromDate": "2025-11-20",
          "toDate": "2025-11-22",
          "shiftId": 1,
          "shift": {
            "id": 1,
            "shiftName": "Ca Ngày",
            "startTime": "08:00",
            "endTime": "17:00"
          },
          "status": "pending",
          "note": "Lịch trực 3 ngày liên tục"
        },
        "contactId": 102,
        "contact": {
          "id": 102,
          "fullName": "Trần Thị B",
          "departmentId": 1,
          "email": "tranthib@company.com",
          "phone": "0901234568",
          "isActive": true
        },
        "role": "backup",
        "status": "assigned",
        "createdAt": "2025-11-19T08:31:00Z"
      }
    ],
    "total": 2,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

**Lưu ý:** Response bao gồm đầy đủ thông tin về schedule, shift và contact liên quan.

---

### 2. Tìm kiếm Schedule Assignments với bộ lọc nâng cao

**Endpoint:** `GET /api/schedule_assignments/filter`

**Mô tả:** Tìm kiếm phân công ca trực với các tiêu chí lọc chi tiết

**Query Parameters:**
- `page` (integer, optional, default: 1): Số trang
- `limit` (integer, optional, default: 10): Số lượng items mỗi trang
- `scheduleId` (long, optional): Lọc theo ID lịch trực
- `contactId` (long, optional): Lọc theo ID người được gán
- `role` (string, optional): Lọc theo vai trò (primary/backup/viewer)
- `status` (string, optional): Lọc theo trạng thái (assigned/checked_in/checked_out/absent/replaced)
- `sortDir` (string, optional, default: "desc"): Hướng sắp xếp
- `sortKey` (string, optional, default: "id"): Trường sắp xếp

**Request Example:**
```
GET http://localhost:8002/api/schedule_assignments/filter?page=1&limit=10&scheduleId=1&role=primary&status=assigned&sortDir=asc&sortKey=id
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "scheduleId": 1,
        "schedule": {
          "id": 1,
          "fromDate": "2025-11-20",
          "toDate": "2025-11-22",
          "shiftId": 1,
          "shift": {
            "id": 1,
            "shiftName": "Ca Ngày",
            "startTime": "08:00",
            "endTime": "17:00"
          },
          "status": "pending",
          "note": "Lịch trực 3 ngày liên tục"
        },
        "contactId": 101,
        "contact": {
          "id": 101,
          "fullName": "Nguyễn Văn A",
          "departmentId": 1,
          "email": "nguyenvana@company.com",
          "phone": "0901234567",
          "isActive": true
        },
        "role": "primary",
        "status": "assigned",
        "createdAt": "2025-11-19T08:30:00Z"
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

**Giải thích filter parameters:**
- `scheduleId`: Lọc tất cả người được gán vào một lịch trực cụ thể
- `contactId`: Lọc tất cả ca trực của một người
- `role`: Lọc theo vai trò
  - primary: Trực chính
  - backup: Trực dự phòng
  - viewer: Người xem/giám sát
- `status`: Lọc theo trạng thái
  - assigned: Đã phân công
  - checked_in: Đã checkin
  - checked_out: Đã checkout
  - absent: Vắng mặt
  - replaced: Đã được thay thế

---

### 3. Thêm mới Schedule Assignment

**Endpoint:** `POST /api/schedule_assignments/create`

**Mô tả:** Tạo mới một phân công ca trực (gán người vào ca)

**Request Body:**
```json
{
  "scheduleId": 1,
  "contactId": 103,
  "role": "primary",
  "status": "assigned"
}
```

**Giải thích các trường:**
- `scheduleId` (long, required): ID của lịch trực cần gán người
- `contactId` (long, required): ID của người được gán vào ca
- `role` (string, optional, default: "primary"): Vai trò trong ca trực
  - primary: Trực chính - Người chính thức trực ca
  - backup: Trực dự phòng - Người thay thế khi cần
  - viewer: Người xem/giám sát - Chỉ theo dõi
- `status` (string, optional, default: "assigned"): Trạng thái phân công
  - assigned: Đã phân công - Mới được gán
  - checked_in: Đã checkin - Đã vào ca
  - checked_out: Đã checkout - Đã kết thúc ca
  - absent: Vắng mặt - Không đến trực
  - replaced: Đã được thay thế - Có người khác thay

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "scheduleId": 1,
    "schedule": {
      "id": 1,
      "fromDate": "2025-11-20",
      "toDate": "2025-11-22",
      "shiftId": 1,
      "shift": {
        "id": 1,
        "shiftName": "Ca Ngày",
        "startTime": "08:00",
        "endTime": "17:00"
      },
      "status": "pending",
      "note": "Lịch trực 3 ngày liên tục"
    },
    "contactId": 103,
    "contact": {
      "id": 103,
      "fullName": "Lê Văn C",
      "departmentId": 2,
      "email": "levanc@company.com",
      "phone": "0901234569",
      "isActive": true
    },
    "role": "primary",
    "status": "assigned",
    "createdAt": "2025-11-19T18:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

---

### 4. Sửa Schedule Assignment

**Endpoint:** `POST /api/schedule_assignments/edit?id={id}`

**Mô tả:** Cập nhật thông tin phân công ca trực

**Query Parameters:**
- `id` (long, required): ID của schedule assignment cần sửa

**Request Body:**
```json
{
  "scheduleId": 1,
  "contactId": 103,
  "role": "primary",
  "status": "checked_in"
}
```

**Request Example:**
```
POST http://localhost:8002/api/schedule_assignments/edit?id=3
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "scheduleId": 1,
    "schedule": {
      "id": 1,
      "fromDate": "2025-11-20",
      "toDate": "2025-11-22",
      "shiftId": 1,
      "shift": {
        "id": 1,
        "shiftName": "Ca Ngày",
        "startTime": "08:00",
        "endTime": "17:00"
      },
      "status": "pending",
      "note": "Lịch trực 3 ngày liên tục"
    },
    "contactId": 103,
    "contact": {
      "id": 103,
      "fullName": "Lê Văn C",
      "departmentId": 2,
      "email": "levanc@company.com",
      "phone": "0901234569",
      "isActive": true
    },
    "role": "primary",
    "status": "checked_in",
    "createdAt": "2025-11-19T18:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

**Use case:** API này thường được dùng để cập nhật status khi người trực checkin/checkout.

---

### 5. Xóa Schedule Assignment (đơn)

**Endpoint:** `DELETE /api/schedule_assignments/delete/{id}`

**Mô tả:** Xóa một phân công ca trực theo ID (gỡ người khỏi ca)

**Path Parameters:**
- `id` (long, required): ID của schedule assignment cần xóa

**Request Example:**
```
DELETE http://localhost:8002/api/schedule_assignments/delete/3
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

**Use case:** Xóa khi muốn gỡ người khỏi ca trực đã được phân công.

---

### 6. Xóa nhiều Schedule Assignments

**Endpoint:** `POST /api/schedule_assignments/delete?ids={ids}`

**Mô tả:** Xóa nhiều phân công ca trực theo danh sách IDs

**Query Parameters:**
- `ids` (array of long, required): Danh sách ID các schedule assignments cần xóa (phân cách bằng dấu phẩy)

**Request Example:**
```
POST http://localhost:8002/api/schedule_assignments/delete?ids=3,4,5
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

**Use case:** Xóa hàng loạt khi cần hủy nhiều phân công cùng lúc.

---

### 7. Sao chép Schedule Assignment

**Endpoint:** `POST /api/schedule_assignments/copy/{id}`

**Mô tả:** Tạo bản sao của một phân công ca trực

**Path Parameters:**
- `id` (long, required): ID của schedule assignment cần sao chép

**Request Example:**
```
POST http://localhost:8002/api/schedule_assignments/copy/1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "scheduleId": 1,
    "schedule": {
      "id": 1,
      "fromDate": "2025-11-20",
      "toDate": "2025-11-22",
      "shiftId": 1,
      "shift": {
        "id": 1,
        "shiftName": "Ca Ngày",
        "startTime": "08:00",
        "endTime": "17:00"
      },
      "status": "pending",
      "note": "Lịch trực 3 ngày liên tục"
    },
    "contactId": 101,
    "contact": {
      "id": 101,
      "fullName": "Nguyễn Văn A",
      "departmentId": 1,
      "email": "nguyenvana@company.com",
      "phone": "0901234567",
      "isActive": true
    },
    "role": "primary",
    "status": "assigned",
    "createdAt": "2025-11-19T19:00:00Z"
  },
  "message": "success",
  "statusCode": 200
}
```

**Use case:** Copy khi muốn gán cùng một người vào nhiều schedule khác nhau với cùng thông tin.

---

### 8. Export Schedule Assignments ra file Excel

**Endpoint:** `GET /api/schedule_assignments/export`

**Mô tả:** Export tất cả schedule assignments ra file Excel (.xlsx)

**Request Example:**
```
GET http://localhost:8002/api/schedule_assignments/export
```

**Response:** File Excel được download với tên `schedule_assignments_export.xlsx`

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Các cột trong file Excel:**
- ID
- Schedule ID
- Schedule From Date
- Schedule To Date
- Shift Name
- Contact ID
- Contact Full Name
- Contact Department ID
- Contact Phone
- Role
- Status
- Created At

---

### 9. Import Schedule Assignments từ file

**Endpoint:** `POST /api/schedule_assignments/import`

**Mô tả:** Import schedule assignments từ file Excel (.xlsx, .xls), CSV, hoặc TXT

**Request:** Multipart form-data

**Form Data:**
- `file` (file, required): File chứa dữ liệu schedule assignments

**Request Example (sử dụng curl):**
```bash
curl -X POST http://localhost:8002/api/schedule_assignments/import \
  -F "file=@schedule_assignments.xlsx"
```

**Request Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8002/api/schedule_assignments/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "scheduleId": 2,
      "schedule": {
        "id": 2,
        "fromDate": "2025-11-23",
        "toDate": null,
        "shiftId": 3,
        "shift": {
          "id": 3,
          "shiftName": "Ca Chiều",
          "startTime": "13:00",
          "endTime": "22:00"
        },
        "status": "active",
        "note": "Trực 1 ngày"
      },
      "contactId": 104,
      "contact": {
        "id": 104,
        "fullName": "Phạm Thị D",
        "departmentId": 1,
        "email": "phamthid@company.com",
        "phone": "0901234570",
        "isActive": true
      },
      "role": "primary",
      "status": "assigned",
      "createdAt": "2025-11-19T20:00:00Z"
    },
    {
      "id": 8,
      "scheduleId": 2,
      "schedule": {
        "id": 2,
        "fromDate": "2025-11-23",
        "toDate": null,
        "shiftId": 3,
        "shift": {
          "id": 3,
          "shiftName": "Ca Chiều",
          "startTime": "13:00",
          "endTime": "22:00"
        },
        "status": "active",
        "note": "Trực 1 ngày"
      },
      "contactId": 105,
      "contact": {
        "id": 105,
        "fullName": "Hoàng Văn E",
        "departmentId": 2,
        "email": "hoangvane@company.com",
        "phone": "0901234571",
        "isActive": true
      },
      "role": "backup",
      "status": "assigned",
      "createdAt": "2025-11-19T20:00:01Z"
    }
  ],
  "message": "Imported 2 schedule assignments successfully",
  "statusCode": 200
}
```

**Hướng dẫn import:**
1. Tải file template mẫu từ endpoint `/api/schedule_assignments/template`
2. Điền dữ liệu vào file theo đúng format
3. Upload file qua API này
4. File Excel phải có các cột: Schedule ID, Contact ID, Role, Status

**Lưu ý quan trọng khi import:**
- Cột "ID" để trống khi thêm mới
- Schedule ID và Contact ID phải tồn tại trong hệ thống
- Role: primary, backup, hoặc viewer
- Status: assigned, checked_in, checked_out, absent, hoặc replaced
- Không được gán trùng: cùng scheduleId và contactId với role giống nhau
- File .csv phải có encoding UTF-8

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

### Ví dụ Error Responses:

**1. Validation Error (400):**
```json
{
  "success": false,
  "data": null,
  "message": "Shift name is required",
  "statusCode": 400
}
```

**2. Not Found Error (404):**
```json
{
  "success": false,
  "data": null,
  "message": "Schedule with id 999 not found",
  "statusCode": 404
}
```

**3. Foreign Key Error (400):**
```json
{
  "success": false,
  "data": null,
  "message": "Shift with id 999 does not exist",
  "statusCode": 400
}
```

**4. Import File Error (400):**
```json
{
  "success": false,
  "data": null,
  "message": "Invalid file format. Please use .xlsx, .xls, .csv, or .txt",
  "statusCode": 400
}
```

---

## Lưu ý khi sử dụng API

### 1. Pagination
- Tất cả API list đều hỗ trợ phân trang
- Page parameter bắt đầu từ 1 (request)
- Response trả về page từ 0 (0-indexed)
- Response format: `data.data` (array), `total`, `page`, `size`
- Tính totalPages: `Math.ceil(total / size)`

### 2. Search Keyword
- Tham số `keyword` tìm kiếm gần đúng (fuzzy search) trên nhiều trường
- Sử dụng `keyword` (chữ thường, không phải keyWord)

### 3. Filter
- API filter cho phép lọc chính xác hơn với nhiều tiêu chí
- Có thể kết hợp nhiều filter parameters cùng lúc

### 4. Date Format
- Tất cả ngày giờ đều sử dụng format:
  - Date: `yyyy-MM-dd` (VD: 2025-11-20)
  - Time: `HH:mm` (VD: 08:00, 17:00)
  - DateTime: ISO 8601 format UTC (VD: 2025-11-19T10:00:00Z)

### 5. Boolean Values
- Sử dụng `true`/`false` (lowercase, không có dấu ngoặc kép)
- Trong URL: `isActive=true`

### 6. List Parameters
- Truyền dưới dạng comma-separated: `ids=1,2,3`

### 7. Import/Export
- **Export:** Sử dụng GET endpoint `/export` để tải file Excel
- **Import:** Sử dụng POST endpoint `/import` với multipart/form-data
- **Template:** Sử dụng GET endpoint `/template` để tải file mẫu trước khi import
- File import phải đúng format của template
- Cột "ID" trong file import có thể để trống khi thêm mới

### 8. Foreign Key References
- `shiftId`: Phải tồn tại trong bảng shifts
- `scheduleId`: Phải tồn tại trong bảng schedule
- `contactId`: Phải tồn tại trong bảng contacts
- API sẽ trả về error 400 nếu foreign key không hợp lệ

### 9. Status Values
- **Schedule status:** pending, active, completed, cancelled, updated
- **Assignment status:** assigned, checked_in, checked_out, absent, replaced

### 10. Role Values
- **Assignment role:** primary, backup, viewer

---

## Business Logic và Use Cases

### 1. Quy trình tạo lịch trực ca

**Bước 1:** Tạo Shift (Ca trực)
```
POST /api/shifts/create
{
  "shiftName": "Ca Ngày",
  "startTime": "08:00",
  "endTime": "17:00",
  "description": "Ca trực ban ngày",
  "isActive": true
}
```

**Bước 2:** Tạo Schedule (Lịch trực)
```
POST /api/schedule/create
{
  "fromDate": "2025-11-20",
  "toDate": "2025-11-22",
  "shiftId": 1,
  "status": "pending",
  "note": "Lịch trực 3 ngày"
}
```

**Bước 3:** Gán người vào ca (Schedule Assignment)
```
POST /api/schedule_assignments/create
{
  "scheduleId": 1,
  "contactId": 101,
  "role": "primary",
  "status": "assigned"
}
```

### 2. Quy trình checkin/checkout

**Checkin:**
```
POST /api/schedule_assignments/edit?id=1
{
  "scheduleId": 1,
  "contactId": 101,
  "role": "primary",
  "status": "checked_in"
}
```

**Checkout:**
```
POST /api/schedule_assignments/edit?id=1
{
  "scheduleId": 1,
  "contactId": 101,
  "role": "primary",
  "status": "checked_out"
}
```

### 3. Thay thế người trực

**Bước 1:** Đánh dấu người cũ là replaced
```
POST /api/schedule_assignments/edit?id=1
{
  "scheduleId": 1,
  "contactId": 101,
  "role": "primary",
  "status": "replaced"
}
```

**Bước 2:** Thêm người mới
```
POST /api/schedule_assignments/create
{
  "scheduleId": 1,
  "contactId": 102,
  "role": "primary",
  "status": "assigned"
}
```

### 4. Ca qua đêm (Overnight Shift)

Hệ thống hỗ trợ ca qua đêm khi `startTime > endTime`:

```json
{
  "shiftName": "Ca Đêm",
  "startTime": "22:00",
  "endTime": "08:00",
  "description": "Ca trực ban đêm (22h tối đến 8h sáng)"
}
```

Ca này bắt đầu lúc 22:00 hôm nay và kết thúc lúc 08:00 sáng hôm sau.

### 5. Lịch trực dài hạn vs ngắn hạn

**Lịch trực 1 ngày:**
```json
{
  "fromDate": "2025-11-20",
  "toDate": null,
  "shiftId": 1
}
```

**Lịch trực nhiều ngày:**
```json
{
  "fromDate": "2025-11-20",
  "toDate": "2025-11-25",
  "shiftId": 1
}
```

### 6. Phân quyền trực (Multiple roles)

Một lịch trực có thể có nhiều người với vai trò khác nhau:

```javascript
// Người trực chính
POST /api/schedule_assignments/create
{
  "scheduleId": 1,
  "contactId": 101,
  "role": "primary"
}

// Người dự phòng
POST /api/schedule_assignments/create
{
  "scheduleId": 1,
  "contactId": 102,
  "role": "backup"
}

// Người giám sát
POST /api/schedule_assignments/create
{
  "scheduleId": 1,
  "contactId": 103,
  "role": "viewer"
}
```

---

## Ví dụ sử dụng cho Frontend

### 1. Lấy danh sách ca trực đang active

```javascript
const response = await fetch(
  'http://localhost:8002/api/shifts/filter?isActive=true&sortDir=asc&sortKey=startTime'
);
const data = await response.json();

if (data.success) {
  const shifts = data.data.data;  // data.data.data - không phải data.data.content
  const total = data.data.total;
  const page = data.data.page;
  const size = data.data.size;
  const totalPages = Math.ceil(total / size);
  console.log('Active shifts:', shifts);
}
```

### 2. Tạo lịch trực mới

```javascript
const createSchedule = async () => {
  const response = await fetch('http://localhost:8002/api/schedule/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fromDate: "2025-11-20",
      toDate: "2025-11-22",
      shiftId: 1,
      status: "pending",
      note: "Lịch trực 3 ngày"
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('Schedule created:', data.data);
  }
};
```

### 3. Gán người vào ca và checkin

```javascript
// Gán người vào ca
const assignToPerson = async (scheduleId, contactId) => {
  const response = await fetch(
    'http://localhost:8002/api/schedule_assignments/create',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduleId: scheduleId,
        contactId: contactId,
        role: "primary",
        status: "assigned"
      })
    }
  );
  return await response.json();
};

// Checkin
const checkIn = async (assignmentId) => {
  const response = await fetch(
    `http://localhost:8002/api/schedule_assignments/edit?id=${assignmentId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: "checked_in"
      })
    }
  );
  return await response.json();
};
```

### 4. Lọc lịch trực theo khoảng thời gian

```javascript
const getSchedulesByDateRange = async (fromDate, toDate) => {
  const params = new URLSearchParams({
    fromDate: fromDate,
    toDate: toDate,
    sortDir: 'asc',
    sortKey: 'fromDate'
  });

  const response = await fetch(
    `http://localhost:8002/api/schedule/filter?${params}`
  );
  const data = await response.json();

  if (data.success) {
    return data.data.data;  // data.data.data - không phải data.data.content
  }
};

// Sử dụng
const schedules = await getSchedulesByDateRange('2025-11-20', '2025-11-30');
console.log('Schedules in range:', schedules);
```

### 5. Import file Excel

```javascript
const importShifts = async (fileInput) => {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  const response = await fetch('http://localhost:8002/api/shifts/import', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  if (data.success) {
    console.log(`Imported ${data.data.length} shifts`);
  } else {
    console.error('Import failed:', data.message);
  }
};
```

### 6. Xem lịch trực của một người

```javascript
const getPersonSchedules = async (contactId) => {
  const response = await fetch(
    `http://localhost:8002/api/schedule_assignments/filter?contactId=${contactId}`
  );
  const data = await response.json();

  if (data.success) {
    const assignments = data.data.data;  // data.data.data - không phải data.data.content
    assignments.forEach(assignment => {
      console.log(`Schedule: ${assignment.schedule.fromDate} - ${assignment.schedule.toDate}`);
      console.log(`Shift: ${assignment.schedule.shift.shiftName}`);
      console.log(`Role: ${assignment.role}`);
      console.log(`Status: ${assignment.status}`);
    });
  }
};
```

### 7. Xem tất cả người trong một lịch trực

```javascript
const getScheduleAssignments = async (scheduleId) => {
  const response = await fetch(
    `http://localhost:8002/api/schedule_assignments/filter?scheduleId=${scheduleId}`
  );
  const data = await response.json();

  if (data.success) {
    const assignments = data.data.data;  // data.data.data - không phải data.data.content

    // Phân loại theo role
    const primary = assignments.filter(a => a.role === 'primary');
    const backup = assignments.filter(a => a.role === 'backup');
    const viewer = assignments.filter(a => a.role === 'viewer');

    console.log('Primary:', primary.map(a => a.contact.fullName));
    console.log('Backup:', backup.map(a => a.contact.fullName));
    console.log('Viewer:', viewer.map(a => a.contact.fullName));
  }
};
```

---

## Template Download Endpoints

Để thuận tiện cho việc import, hệ thống cung cấp các endpoint download template:

### 1. Shifts Template
```
GET http://localhost:8002/api/shifts/template
```

### 2. Schedule Template
```
GET http://localhost:8002/api/schedule/template
```

### 3. Schedule Assignments Template
```
GET http://localhost:8002/api/schedule_assignments/template
```

Các file template này chứa header và dữ liệu mẫu để người dùng hiểu format khi import.

---

**Phiên bản:** 1.0
**Ngày cập nhật:** 2025-11-19
**Tác giả:** Backend Team
