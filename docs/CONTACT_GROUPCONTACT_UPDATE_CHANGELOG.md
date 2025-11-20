# Tài liệu Cập nhật API - Contact & Group Contact

## Phiên bản: 2.0
## Ngày cập nhật: 2024-11-20

---

## 1. THAY ĐỔI DATABASE

### 1.1 Bảng `contacts` - Liên kết với Department

**THAY ĐỔI:**
- **XÓA** trường `unit` (VARCHAR)
- **THÊM** trường `department_id` (INTEGER, FK to sys_department)

```sql
-- Cấu trúc mới
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    department_id INTEGER REFERENCES sys_department(id) ON DELETE SET NULL,  -- MỚI
    email VARCHAR(200),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Bảng `contact_groups` - Liên kết Contact với Group

**Bảng này đã tồn tại để quản lý quan hệ nhiều-nhiều giữa `contacts` và `sys_group_contacts`:**

```sql
CREATE TABLE contact_groups (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES sys_group_contacts(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contact_id, group_id)
);
```

---

## 2. THAY ĐỔI API - CONTACT MODULE

### 2.1 API Filter Contacts

**Endpoint:** `GET /api/contacts/filter`

**THAY ĐỔI Parameter:**
- **XÓA:** `unit` (String)
- **THÊM:** `departmentId` (Long)

**Request MỚI:**
```
GET http://localhost:8002/api/contacts/filter?page=1&limit=10&departmentId=1&isActive=true
```

**Query Parameters:**
| Parameter | Kiểu cũ | Kiểu mới | Mô tả |
|-----------|---------|----------|-------|
| fullName | String | String | (không đổi) |
| ~~unit~~ | ~~String~~ | - | **ĐÃ XÓA** |
| **departmentId** | - | **Long** | **MỚI** - ID đơn vị từ sys_department |
| email | String | String | (không đổi) |
| phone | String | String | (không đổi) |
| isActive | Boolean | Boolean | (không đổi) |

---

### 2.2 API Create/Edit Contact

**Endpoint:**
- `POST /api/contacts/create`
- `POST /api/contacts/edit?id={id}`

**Request Body MỚI:**
```json
{
  "fullName": "Nguyễn Văn A",
  "departmentId": 1,           // MỚI - ID đơn vị (thay cho unit)
  "email": "nguyenvana@company.com",
  "phone": "0901234567",
  "isActive": true,
  "notes": "Ghi chú"
}
```

**THAY ĐỔI:**
- **XÓA:** `unit` (String)
- **THÊM:** `departmentId` (Long) - ID của đơn vị trong bảng `sys_department`

---

### 2.3 Response của Contact

**Response MỚI sẽ bao gồm thông tin department:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "departmentId": 1,
    "department": {
      "id": 1,
      "name": "Phòng Khai thác Miền Bắc",
      "deptCode": "KTMB",
      "description": "Phòng Khai thác Miền Bắc"
    },
    "email": "nguyenvana@company.com",
    "phone": "0901234567",
    "isActive": true,
    "notes": null,
    "createdAt": "2024-11-20T10:00:00Z",
    "updatedAt": "2024-11-20T10:00:00Z"
  },
  "message": "Success",
  "statusCode": 200
}
```

**LƯU Ý:**
- Khi gọi API list/get, response sẽ có object `department` với đầy đủ thông tin đơn vị
- Khi gọi API create/edit, chỉ cần gửi `departmentId`

---

### 2.4 Cập nhật Frontend cần làm

**Trước:**
```javascript
// OLD - Không còn hoạt động
const contact = {
  fullName: "Nguyễn Văn A",
  unit: "Phòng Vận hành",  // ❌ Đã bỏ
  ...
};
```

**Sau:**
```javascript
// NEW - Cách mới
const contact = {
  fullName: "Nguyễn Văn A",
  departmentId: 1,  // ✅ Sử dụng ID từ dropdown/select
  ...
};

// Hiển thị tên đơn vị từ response
const departmentName = contact.department?.name || "";
```

---

## 3. API MỚI - QUẢN LÝ CONTACTS TRONG GROUP

### 3.1 Lấy danh sách Contacts trong một Group

**Endpoint:** `GET /api/group_contacts/{groupId}/contacts`

**Mô tả:** Lấy tất cả contacts thuộc một nhóm

**Request:**
```
GET http://localhost:8002/api/group_contacts/1/contacts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "departmentId": 1,
      "department": {
        "id": 1,
        "name": "Phòng Khai thác Miền Bắc"
      },
      "email": "nguyenvana@company.com",
      "phone": "0901234567",
      "isActive": true
    },
    {
      "id": 2,
      "fullName": "Trần Thị B",
      "departmentId": 1,
      "department": {
        "id": 1,
        "name": "Phòng Khai thác Miền Bắc"
      },
      "email": "tranthib@company.com",
      "phone": "0901234568",
      "isActive": true
    }
  ],
  "message": "Success",
  "statusCode": 200
}
```

---

### 3.2 Thêm Contact vào Group

**Endpoint:** `POST /api/group_contacts/{groupId}/contacts/add?contactId={contactId}`

**Mô tả:** Thêm một contact vào một nhóm

**Request:**
```
POST http://localhost:8002/api/group_contacts/1/contacts/add?contactId=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "contactId": 5,
    "groupId": 1,
    "assignedAt": "2024-11-20T10:30:00Z"
  },
  "message": "Contact added to group successfully",
  "statusCode": 200
}
```

**Error Response (nếu đã tồn tại):**
```json
{
  "success": false,
  "data": null,
  "message": "Contact already exists in this group",
  "statusCode": 400
}
```

---

### 3.3 Thêm nhiều Contacts vào Group

**Endpoint:** `POST /api/group_contacts/{groupId}/contacts/add-multiple?contactIds={ids}`

**Mô tả:** Thêm nhiều contacts vào một nhóm cùng lúc

**Request:**
```
POST http://localhost:8002/api/group_contacts/1/contacts/add-multiple?contactIds=5,6,7,8
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "contactId": 5,
      "groupId": 1,
      "assignedAt": "2024-11-20T10:30:00Z"
    },
    {
      "id": 12,
      "contactId": 6,
      "groupId": 1,
      "assignedAt": "2024-11-20T10:30:00Z"
    }
  ],
  "message": "Contacts added to group successfully",
  "statusCode": 200
}
```

**LƯU Ý:** API sẽ bỏ qua các contact không tồn tại hoặc đã có trong nhóm

---

### 3.4 Xóa Contact khỏi Group

**Endpoint:** `DELETE /api/group_contacts/{groupId}/contacts/remove?contactId={contactId}`

**Mô tả:** Xóa một contact khỏi một nhóm

**Request:**
```
DELETE http://localhost:8002/api/group_contacts/1/contacts/remove?contactId=5
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Contact removed from group successfully",
  "statusCode": 200
}
```

---

### 3.5 Xóa nhiều Contacts khỏi Group

**Endpoint:** `POST /api/group_contacts/{groupId}/contacts/remove-multiple?contactIds={ids}`

**Mô tả:** Xóa nhiều contacts khỏi một nhóm cùng lúc

**Request:**
```
POST http://localhost:8002/api/group_contacts/1/contacts/remove-multiple?contactIds=5,6,7
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Contacts removed from group successfully",
  "statusCode": 200
}
```

---

### 3.6 Đếm số Contacts trong Group

**Endpoint:** `GET /api/group_contacts/{groupId}/contacts/count`

**Mô tả:** Lấy số lượng contacts trong một nhóm

**Request:**
```
GET http://localhost:8002/api/group_contacts/1/contacts/count
```

**Response:**
```json
{
  "success": true,
  "data": 5,
  "message": "Success",
  "statusCode": 200
}
```

---

## 4. HƯỚNG DẪN CẬP NHẬT FRONTEND

### 4.1 Màn hình Contact - Sửa form Create/Edit

**Thay đổi cần làm:**
1. **Xóa** input text field `unit` (Đơn vị)
2. **Thêm** dropdown/select `departmentId` để chọn đơn vị từ danh sách

```javascript
// Lấy danh sách departments
const fetchDepartments = async () => {
  const response = await fetch('http://localhost:8002/api/departments');
  const data = await response.json();
  return data.data.data; // Danh sách departments
};

// Form tạo contact
<select name="departmentId" required>
  <option value="">-- Chọn đơn vị --</option>
  {departments.map(dept => (
    <option key={dept.id} value={dept.id}>{dept.name}</option>
  ))}
</select>
```

### 4.2 Màn hình Group Contact - Thêm tính năng quản lý contacts

**Các tính năng cần thêm:**
1. **Hiển thị danh sách contacts** trong group (sử dụng API 3.1)
2. **Thêm contact vào group** (modal chọn contacts, sử dụng API 3.2 hoặc 3.3)
3. **Xóa contact khỏi group** (button delete, sử dụng API 3.4 hoặc 3.5)
4. **Hiển thị số lượng contacts** trong mỗi group (sử dụng API 3.6)

**Ví dụ giao diện:**
```
+----------------------------------------+
| Nhóm Khẩn cấp              [4 contacts] |
+----------------------------------------+
| □ Nguyễn Văn A - nguyenvana@...  [Xóa] |
| □ Trần Thị B - tranthib@...      [Xóa] |
| □ Lê Văn C - levanc@...          [Xóa] |
| □ Phạm Thị D - phamthid@...      [Xóa] |
+----------------------------------------+
| [Thêm contact]  [Xóa đã chọn]          |
+----------------------------------------+
```

---

## 5. CHECKLIST CẬP NHẬT

### Backend (Đã hoàn thành)
- [x] Cập nhật database schema (contacts.department_id)
- [x] Cập nhật Contact entity
- [x] Cập nhật ContactRepository
- [x] Cập nhật ContactService
- [x] Cập nhật ContactController
- [x] Tạo ContactGroup entity
- [x] Tạo ContactGroupRepository
- [x] Thêm API quản lý contacts trong group

### Frontend (Cần làm)
- [ ] Cập nhật form Create/Edit Contact (thay unit → departmentId dropdown)
- [ ] Cập nhật filter Contact (thay unit → departmentId)
- [ ] Hiển thị tên đơn vị từ `contact.department.name`
- [ ] Thêm màn hình/modal quản lý contacts trong group
- [ ] Tích hợp các API mới cho Group-Contact relationship

---

## 6. MIGRATION DATA

Nếu có dữ liệu cũ với trường `unit`, cần chạy migration để map sang `department_id`:

```sql
-- Ví dụ migration (cần điều chỉnh theo dữ liệu thực tế)
UPDATE contacts
SET department_id = (
  SELECT id FROM sys_department WHERE name ILIKE contacts.unit
)
WHERE unit IS NOT NULL;

-- Sau đó xóa cột unit
ALTER TABLE contacts DROP COLUMN IF EXISTS unit;
```

---

## 7. LIÊN HỆ HỖ TRỢ

Nếu có thắc mắc về API hoặc gặp lỗi, vui lòng liên hệ team Backend.

---

**Phiên bản tài liệu:** 2.0
**Ngày cập nhật:** 2024-11-20
**Tác giả:** Backend Team
