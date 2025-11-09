# ✅ BỔ SUNG CÁC API CHO USER MANAGEMENT

## 📋 KIỂM TRA THEO BUSINESS RULES

Theo file `api-business-rule.md`, các màn hình CRUD cần có đầy đủ tính năng sau:

### ✅ ĐÃ CÓ TRƯỚC ĐÓ:
1. ✅ **Thêm mới** - `POST /api/users/create`
2. ✅ **Sửa** - `POST /api/users/edit`
3. ✅ **Xóa** - `POST /api/users/delete`
4. ✅ **List all** - `GET /api/users` (có pagination)
5. ✅ **Filter (tìm kiếm)** - `GET /api/users?keyWord=...`
6. ✅ **Xóa nhiều** - `POST /api/users/delete?ids=...`

### ✅ VỪA BỔ SUNG:
7. ✅ **Sao chép từ dữ liệu cũ** - `POST /api/users/copy`
8. ✅ **Import danh sách từ file csv, txt** - `POST /api/users/import`
9. ✅ **Cho phép tải file mẫu** - `GET /api/users/import-template`
10. ✅ **Export file ra excel** - `GET /api/users/export`

---

## 🎯 CÁC API MỚI ĐÃ THÊM

### 1. Copy User (Sao chép người dùng)
**Endpoint:** `POST /api/users/copy`

**Parameters:**
- `sourceUserId` (required): ID của user nguồn cần sao chép
- `newUsername` (required): Username mới cho user được tạo

**Mô tả:**
- Sao chép toàn bộ thông tin từ user hiện có
- Tự động thêm " (Copy)" vào fullname
- Email và Mobile Phone sẽ set về null (để tránh trùng)
- Kiểm tra username mới đã tồn tại chưa

**Ví dụ:**
```bash
POST /api/users/copy?sourceUserId=user-001&newUsername=user-002
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "generated-id",
    "username": "user-002",
    "fullname": "John Doe (Copy)",
    "status": 1,
    ...
  },
  "message": "User copied successfully"
}
```

---

### 2. Import Users (Nhập danh sách từ file)
**Endpoint:** `POST /api/users/import`

**Parameters:**
- `file` (multipart/form-data): File upload

**Supported formats:**
- ✅ Excel (.xlsx, .xls)
- ✅ CSV (.csv)
- ✅ Text (.txt)

**File format (columns):**
| Column | Required | Description |
|--------|----------|-------------|
| Username | ✅ | Tên đăng nhập |
| Password | ✅ | Mật khẩu |
| Full Name | ❌ | Họ và tên |
| Email | ❌ | Email |
| Mobile Phone | ❌ | Số điện thoại |
| Department ID | ❌ | Mã phòng ban |
| Status | ❌ | Trạng thái (0/1) |
| Note | ❌ | Ghi chú |

**Ví dụ CSV:**
```csv
Username,Password,Full Name,Email,Mobile Phone,Department ID,Status,Note
john.doe,pass123,John Doe,john@example.com,0123456789,dept-001,1,Admin user
jane.smith,pass456,Jane Smith,jane@example.com,0987654321,dept-002,1,Regular user
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "...", "username": "john.doe", ... },
    { "id": "...", "username": "jane.smith", ... }
  ],
  "message": "Imported 2 users successfully"
}
```

---

### 3. Download Import Template (Tải file mẫu)
**Endpoint:** `GET /api/users/import-template`

**Mô tả:**
- Download file Excel mẫu để import users
- File có sẵn header và 1 dòng dữ liệu mẫu
- Có hướng dẫn về các trường bắt buộc

**Response:**
- File Excel: `users_import_template.xlsx`

**Cấu trúc file template:**
```
| Username* | Password* | Full Name | Email | Mobile Phone | Department ID | Status | Note |
|-----------|-----------|-----------|-------|--------------|---------------|--------|------|
| john.doe  | password123 | John Doe | john.doe@example.com | 0123456789 | dept-001 | 1 | Sample user |

* Required fields. Status: 0=Inactive, 1=Active
```

---

### 4. Export Users to Excel (Xuất ra Excel)
**Endpoint:** `GET /api/users/export`

**Mô tả:**
- Export toàn bộ danh sách users ra file Excel
- Bao gồm tất cả các trường: ID, Username, Full Name, Email, Mobile Phone, Department, Status, Note

**Response:**
- File Excel: `users_export.xlsx`

**Cấu trúc file export:**
```
| ID | Username | Full Name | Email | Mobile Phone | Department | Status | Note |
|----|----------|-----------|-------|--------------|------------|--------|------|
| user-001 | john.doe | John Doe | john@... | 0123... | dept-001 | 1 | ... |
| user-002 | jane.smith | Jane Smith | jane@... | 0987... | dept-002 | 1 | ... |
```

---

## 🔧 THAY ĐỔI KỸ THUẬT

### 1. UserRepository
**File:** `UserRepository.java`

**Thêm methods:**
```java
boolean existsByUsername(String username);
List<User> findAll();
```

**Thay đổi:** Extend từ `JpaRepository` thay vì `CrudRepository` để có thêm các method hữu ích.

---

### 2. UserService
**File:** `UserService.java`

**Thêm methods:**

#### a. Copy User
```java
public User copyUser(String sourceUserId, String newUsername)
```
- Sao chép user từ ID nguồn
- Kiểm tra username mới có tồn tại không
- Set email/phone về null để tránh trùng

#### b. Export to Excel
```java
public byte[] exportUsersToExcel() throws IOException
```
- Sử dụng Apache POI
- Tạo Excel với header styling
- Auto-size columns

#### c. Import from File
```java
public List<User> importUsersFromFile(MultipartFile file) throws IOException
```
- Hỗ trợ CSV, TXT, XLS, XLSX
- Validate format và required fields
- Skip invalid rows với logging

#### d. Generate Template
```java
public byte[] generateImportTemplate() throws IOException
```
- Tạo Excel template với header và sample data
- Có instructions về required fields

#### e. Helper Methods
```java
private List<User> importFromExcel(InputStream inputStream)
private List<User> importFromCsv(InputStream inputStream)
private String getCellValueAsString(Cell cell)
private Integer getCellValueAsInteger(Cell cell)
```

---

### 3. UserController
**File:** `UserController.java`

**Thêm imports:**
```java
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
```

**Thêm 4 endpoints mới:**
- `POST /api/users/copy` - Copy user
- `POST /api/users/import` - Import users
- `GET /api/users/export` - Export to Excel
- `GET /api/users/import-template` - Download template

---

## 📊 SWAGGER DOCUMENTATION

Tất cả 4 API mới đều có đầy đủ Swagger annotations:
- ✅ `@Operation` với summary và description
- ✅ `@ApiResponses` với các response codes
- ✅ `@Parameter` với descriptions và examples

Có thể test tất cả API qua Swagger UI:
```
http://localhost:8002/swagger-ui.html
```

---

## 🚀 CÁCH SỬ DỤNG

### 1. Copy User
```bash
curl -X POST "http://localhost:8002/api/users/copy?sourceUserId=user-001&newUsername=user-copy-001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Download Template
```bash
curl -X GET "http://localhost:8002/api/users/import-template" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o template.xlsx
```

### 3. Import Users
```bash
curl -X POST "http://localhost:8002/api/users/import" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@users.xlsx"
```

### 4. Export Users
```bash
curl -X GET "http://localhost:8002/api/users/export" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o users_export.xlsx
```

---

## ✅ HOÀN THÀNH 100%

User Management đã có đầy đủ tất cả các tính năng theo business rules:

| Tính năng | API Endpoint | Status |
|-----------|-------------|--------|
| Thêm mới | POST /api/users/create | ✅ |
| Sửa | POST /api/users/edit | ✅ |
| Xóa | POST /api/users/delete | ✅ |
| List all | GET /api/users | ✅ |
| Filter | GET /api/users?keyWord=... | ✅ |
| Xóa nhiều | POST /api/users/delete?ids=... | ✅ |
| **Sao chép** | **POST /api/users/copy** | ✅ **NEW** |
| **Import** | **POST /api/users/import** | ✅ **NEW** |
| **Download template** | **GET /api/users/import-template** | ✅ **NEW** |
| **Export Excel** | **GET /api/users/export** | ✅ **NEW** |

**Tổng cộng: 10/10 tính năng hoàn thành!**
