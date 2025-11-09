# 📋 BACKEND API CẦN IMPLEMENT CHO USER MANAGEMENT

## ⚠️ TÌNH TRẠNG HIỆN TẠI

Frontend đã được cập nhật đầy đủ với tất cả các tính năng CRUD theo business rules, nhưng **Backend chưa có các API endpoints cho User Management**.

File `server/routes.ts` hiện tại chỉ có các routes cho:
- Systems
- Contacts
- Groups
- Rules
- Alerts
- Schedules
- Incidents
- Logs
- Stats

**CHƯA CÓ**: User Management APIs

---

## 🎯 CÁC API ENDPOINTS CẦN IMPLEMENT

### ✅ CƠ BẢN (CẦN THIẾT)

#### 1. GET /api/users
**Mục đích**: Lấy danh sách users với pagination và search

**Query Parameters**:
- `page` (number): Trang hiện tại
- `limit` (number): Số lượng items trên mỗi trang
- `sort_dir` (string): "asc" hoặc "desc"
- `sort_key` (string): Tên field để sort (vd: "createdAt")
- `keyWord` (string, optional): Từ khóa tìm kiếm

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "username": "john.doe",
        "fullname": "John Doe",
        "email": "john@example.com",
        "department": {
          "id": "dept-id",
          "name": "IT",
          "deptCode": "IT-001",
          "desc": "IT Department",
          "createdAt": "2025-01-01T00:00:00.000Z"
        },
        "mobilePhone": "0123456789",
        "status": 1,
        "userNote": "Admin user",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  },
  "message": "Success",
  "statusCode": 200
}
```

---

#### 2. POST /api/users/create
**Mục đích**: Tạo user mới

**Request Body**:
```json
{
  "username": "john.doe",
  "password": "password123",
  "fullname": "John Doe",
  "email": "john@example.com",
  "department": "dept-code",
  "mobilePhone": "0123456789",
  "status": 1,
  "userNote": "Admin user"
}
```

**Response**: User object đã tạo

---

#### 3. POST /api/users/edit
**Mục đích**: Cập nhật thông tin user

**Query Parameters**:
- `id` (required): ID của user cần edit

**Request Body**: Same as create (password optional)

**Response**: User object đã update

---

#### 4. POST /api/users/delete
**Mục đích**: Xóa một hoặc nhiều users

**Query Parameters**:
- `ids` (required): ID hoặc danh sách IDs cách nhau bởi dấu phẩy
  - Single: `ids=user-001`
  - Multiple: `ids=user-001,user-002,user-003`

**Response**:
```json
{
  "success": true,
  "message": "Deleted successfully"
}
```

---

### 🆕 TÍNH NĂNG MỚI (THEO BUSINESS RULES)

#### 5. POST /api/users/copy
**Mục đích**: Sao chép user từ user hiện có

**Query Parameters**:
- `sourceUserId` (required): ID của user nguồn
- `newUsername` (required): Username cho user mới

**Logic**:
- Sao chép toàn bộ thông tin từ user nguồn
- Tự động thêm " (Copy)" vào fullname
- Set email và mobilePhone về null (để tránh trùng)
- Password phải được reset (để người dùng tự đặt)

**Response**: User object mới được tạo

---

#### 6. POST /api/users/import
**Mục đích**: Import danh sách users từ file

**Request**: multipart/form-data
- `file`: File upload (Excel .xlsx, .xls hoặc CSV .csv, .txt)

**File Format (columns)**:
| Column | Required | Type | Description |
|--------|----------|------|-------------|
| Username | ✅ | string | Tên đăng nhập (unique) |
| Password | ✅ | string | Mật khẩu |
| Full Name | ❌ | string | Họ và tên |
| Email | ❌ | string | Email |
| Mobile Phone | ❌ | string | Số điện thoại |
| Department ID | ❌ | string | Mã phòng ban |
| Status | ❌ | 0 hoặc 1 | Trạng thái (default: 1) |
| Note | ❌ | string | Ghi chú |

**Response**:
```json
{
  "success": true,
  "data": [
    { "id": "...", "username": "john.doe", ... },
    { "id": "...", "username": "jane.smith", ... }
  ],
  "message": "Imported 2 users successfully",
  "errors": [
    { "row": 5, "error": "Username already exists" }
  ]
}
```

**Logic**:
- Validate format file
- Kiểm tra required fields
- Skip invalid rows và ghi log errors
- Hash passwords trước khi lưu
- Validate username unique

---

#### 7. GET /api/users/import-template
**Mục đích**: Download file Excel template để import

**Response**: File Excel với:
- Header row với tên các columns
- 1 dòng sample data
- Instructions về required fields

**File name**: `users_import_template.xlsx`

---

#### 8. GET /api/users/export
**Mục đích**: Export toàn bộ users ra file Excel

**Response**: File Excel chứa toàn bộ users với các columns:
- ID
- Username
- Full Name
- Email
- Mobile Phone
- Department
- Status
- Note
- Created At
- Updated At

**File name**: `users_export.xlsx`

---

## 🔐 AUTHENTICATION & AUTHORIZATION

Tất cả các endpoints trên cần:
1. **Authentication**: Kiểm tra token hợp lệ
2. **Authorization**: Kiểm tra quyền của user
   - Admin: Full access
   - Manager: Read + Create + Edit (own department)
   - User: Read only

**Xử lý session timeout**:
- Trả về status code `401 Unauthorized` khi token hết hạn
- Frontend đã có logic tự động logout và redirect về login

---

## 🗄️ DATABASE SCHEMA (Gợi ý)

```typescript
interface User {
  id: string;              // UUID
  username: string;        // unique
  password: string;        // hashed
  fullname: string;
  email: string | null;
  departmentId: string | null;  // Foreign key
  mobilePhone: string | null;
  status: number;          // 0 = inactive, 1 = active
  userNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Department {
  id: string;
  name: string;
  deptCode: string;        // unique
  desc: string;
  createdAt: Date;
}
```

---

## 📚 DEPENDENCIES CẦN THIẾT

Để implement các tính năng import/export Excel:

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/multer": "^1.4.11"
  }
}
```

Hoặc sử dụng Apache POI nếu backend là Java (theo USER_API_ENHANCEMENTS_SUMMARY.md)

---

## 🚀 HƯỚNG DẪN IMPLEMENT

### Bước 1: Tạo Database Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  department_id UUID REFERENCES departments(id),
  mobile_phone VARCHAR(20),
  status INTEGER DEFAULT 1,
  user_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
```

### Bước 2: Tạo Storage Methods
Trong `server/storage.ts`, thêm các methods:
- `getUsers(page, limit, sortKey, sortDir, keyWord)`
- `getUserById(id)`
- `createUser(data)`
- `updateUser(id, data)`
- `deleteUsers(ids)`
- `copyUser(sourceId, newUsername)`
- `importUsers(users)`
- `exportUsers()`

### Bước 3: Tạo Routes
Trong `server/routes.ts`, thêm:
```typescript
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

// Basic CRUD
app.get("/api/users", authenticateToken, async (req, res) => { ... });
app.post("/api/users/create", authenticateToken, async (req, res) => { ... });
app.post("/api/users/edit", authenticateToken, async (req, res) => { ... });
app.post("/api/users/delete", authenticateToken, async (req, res) => { ... });

// Advanced features
app.post("/api/users/copy", authenticateToken, async (req, res) => { ... });
app.post("/api/users/import", authenticateToken, upload.single('file'), async (req, res) => { ... });
app.get("/api/users/import-template", authenticateToken, async (req, res) => { ... });
app.get("/api/users/export", authenticateToken, async (req, res) => { ... });
```

### Bước 4: Implement Authentication
```typescript
import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
```

---

## ✅ CHECKLIST

### Backend Implementation
- [ ] Tạo database schema cho users và departments
- [ ] Implement storage methods
- [ ] Implement basic CRUD endpoints
- [ ] Implement copy endpoint
- [ ] Implement import endpoint
- [ ] Implement export endpoint
- [ ] Implement template download endpoint
- [ ] Add authentication middleware
- [ ] Add authorization checks
- [ ] Handle password hashing (bcrypt)
- [ ] Add input validation
- [ ] Add error handling
- [ ] Write unit tests

### Frontend (✅ ĐÃ HOÀN THÀNH)
- ✅ Tạo API helper với auto logout
- ✅ Update auth context với redirect
- ✅ Implement danh sách users với pagination
- ✅ Implement tìm kiếm
- ✅ Implement thêm/sửa/xóa
- ✅ Implement xóa nhiều
- ✅ Implement sao chép
- ✅ Implement import
- ✅ Implement export
- ✅ Implement download template

---

## 🔗 THAM KHẢO

- **Business Rules**: `crud-business-rule copy.md`
- **API Documentation**: `USER_API_ENHANCEMENTS_SUMMARY.md`
- **Frontend Code**: `client/src/pages/UserManagement.tsx`
- **API Helper**: `client/src/lib/api.ts`
- **Auth Context**: `client/src/lib/auth-context.tsx`

---

## 📞 LƯU Ý

Khi implement backend xong, các API endpoints cần khớp chính xác với những gì frontend đang call:
- Đúng URL paths
- Đúng HTTP methods
- Đúng request/response format
- Đúng status codes (đặc biệt 401 cho session timeout)

Frontend đã sẵn sàng và sẽ hoạt động ngay khi backend được implement đúng theo spec trên.
