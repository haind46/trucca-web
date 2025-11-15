# API System Level - Quản lý Cấp độ Hệ thống

## Thông tin chung

**Base URL:** `http://localhost:8080/api/systemLevel`

**Version:** 1.0

**Authentication:** Required (JWT Token)

**Naming Convention:** camelCase

---

## 📝 Tổng quan

API này cung cấp đầy đủ chức năng CRUD cho quản lý cấp độ hệ thống (System Level) theo business rules:

### ✅ Các tính năng hỗ trợ:
- ✓ Thêm mới cấp độ hệ thống
- ✓ Sửa cấp độ hệ thống
- ✓ Xóa cấp độ hệ thống (đơn hoặc nhiều)
- ✓ Danh sách tất cả cấp độ (phân trang)
- ✓ Tìm kiếm/Filter gần đúng
- ✓ Sao chép cấp độ từ dữ liệu cũ
- ✓ Import từ file (CSV, TXT, Excel)
- ✓ Export ra Excel
- ✓ Tải file mẫu (template)

---

## 📚 Endpoints

### 1. Lấy danh sách cấp độ hệ thống (Paginated)

**GET** `/api/systemLevel`

Lấy danh sách cấp độ hệ thống với phân trang, tìm kiếm và sắp xếp.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Số trang (bắt đầu từ 1) |
| `limit` | number | No | 10 | Số bản ghi mỗi trang |
| `keyWord` | string | No | - | Từ khóa tìm kiếm (tìm trong level, description, createdBy, updatedBy) |
| `sortDir` | string | No | desc | Hướng sắp xếp: `asc` hoặc `desc` |
| `sortKey` | string | No | id | Trường sắp xếp: `id`, `level`, `createdAt`, `updatedAt` |

#### Request Example

```bash
# Lấy trang 1, 10 bản ghi
GET /api/systemLevel?page=1&limit=10

# Tìm kiếm "Critical"
GET /api/systemLevel?keyWord=Critical

# Sắp xếp theo level tăng dần
GET /api/systemLevel?sortKey=level&sortDir=asc
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "id": 1,
        "level": "Critical",
        "description": "Critical system level requiring immediate attention",
        "createdAt": "2024-01-15T10:30:00Z",
        "createdBy": "admin",
        "updatedAt": "2024-01-15T10:30:00Z",
        "updatedBy": "admin"
      },
      {
        "id": 2,
        "level": "High",
        "description": "High priority system level",
        "createdAt": "2024-01-15T11:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2024-01-15T11:00:00Z",
        "updatedBy": null
      }
    ],
    "totalElements": 25,
    "totalPages": 3,
    "currentPage": 1,
    "pageSize": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 2. Tạo cấp độ hệ thống mới

**POST** `/api/systemLevel/create`

Tạo một cấp độ hệ thống mới.

#### Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "level": "Critical",
  "description": "Critical system level requiring immediate attention",
  "createdBy": "admin"
}
```

#### Request Body Schema

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `level` | string | Yes | 255 | Tên cấp độ (phải unique) |
| `description` | string | No | 1000 | Mô tả cấp độ |
| `createdBy` | string | No | 255 | Người tạo |

#### Validation Rules

- `level`: Không được để trống, tối đa 255 ký tự, phải unique
- `description`: Tùy chọn, tối đa 1000 ký tự
- `createdBy`: Tùy chọn, tối đa 255 ký tự

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SUCCESS",
  "data": {
    "id": 6,
    "level": "Critical",
    "description": "Critical system level requiring immediate attention",
    "createdAt": "2024-01-15T14:25:30Z",
    "createdBy": "admin",
    "updatedAt": "2024-01-15T14:25:30Z",
    "updatedBy": null
  }
}
```

#### Response Error (400 Bad Request)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "System level already exists: Critical",
  "data": null
}
```

---

### 3. Cập nhật cấp độ hệ thống

**POST** `/api/systemLevel/edit`

Cập nhật thông tin cấp độ hệ thống.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của cấp độ cần cập nhật |

#### Request Body

```json
{
  "level": "Critical - Updated",
  "description": "Updated description",
  "updatedBy": "admin"
}
```

**Lưu ý:** Chỉ gửi các field cần cập nhật.

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SUCCESS",
  "data": {
    "id": 1,
    "level": "Critical - Updated",
    "description": "Updated description",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-01-15T15:00:00Z",
    "updatedBy": "admin"
  }
}
```

---

### 4. Xóa cấp độ hệ thống

**POST** `/api/systemLevel/delete`

Xóa một hoặc nhiều cấp độ hệ thống.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | number[] | Yes | Danh sách IDs cần xóa (phân cách bằng dấu phẩy) |

#### Request Example

```bash
# Xóa 1 system level
POST /api/systemLevel/delete?ids=5

# Xóa nhiều system levels
POST /api/systemLevel/delete?ids=3,4,5
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SUCCESS",
  "data": null
}
```

---

### 5. Sao chép cấp độ hệ thống

**POST** `/api/systemLevel/copy/{id}`

Tạo bản sao từ cấp độ hệ thống hiện có.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của cấp độ cần sao chép |

#### Request Example

```bash
POST /api/systemLevel/copy/1
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SUCCESS",
  "data": {
    "id": 7,
    "level": "Critical (Copy)",
    "description": "Critical system level requiring immediate attention",
    "createdAt": "2024-01-15T16:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2024-01-15T16:00:00Z",
    "updatedBy": null
  }
}
```

**Lưu ý:** Tên level được tự động thêm " (Copy)" để tránh trùng lặp.

---

### 6. Export ra Excel

**GET** `/api/systemLevel/export`

Export tất cả cấp độ hệ thống ra file Excel.

#### Response Success (200 OK)

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `system_levels_export.xlsx`

#### Cấu trúc file Excel:

| ID | Level | Description | Created By | Created At | Updated By | Updated At |
|----|-------|-------------|------------|------------|------------|------------|
| 1 | Critical | Critical level | admin | 2024-01-15... | admin | 2024-01-15... |
| 2 | High | High level | admin | 2024-01-15... | | 2024-01-15... |

#### cURL Example

```bash
curl -X GET "http://localhost:8080/api/systemLevel/export" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output system_levels.xlsx
```

---

### 7. Import từ file

**POST** `/api/systemLevel/import`

Import cấp độ hệ thống từ file Excel, CSV hoặc TXT.

#### Request Headers

```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

#### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | File upload (.xlsx, .xls, .csv, .txt) |

#### File Format

**Excel/CSV/TXT columns:**
1. `Level` (required) - Tên cấp độ
2. `Description` (optional) - Mô tả
3. `Created By` (optional) - Người tạo

**Ví dụ CSV:**
```csv
Level,Description,Created By
Critical,Critical system level requiring immediate attention,admin
High,High priority system level,admin
Medium,Medium priority system level,user1
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Imported 3 system levels successfully",
  "data": [
    {
      "id": 8,
      "level": "Critical",
      "description": "Critical system level requiring immediate attention",
      "createdAt": "2024-01-15T17:00:00Z",
      "createdBy": "admin",
      "updatedAt": "2024-01-15T17:00:00Z",
      "updatedBy": null
    },
    {
      "id": 9,
      "level": "High",
      "description": "High priority system level",
      "createdAt": "2024-01-15T17:00:01Z",
      "createdBy": "admin",
      "updatedAt": "2024-01-15T17:00:01Z",
      "updatedBy": null
    }
  ]
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:8080/api/systemLevel/import" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@system_levels.xlsx"
```

**Lưu ý:**
- Level đã tồn tại sẽ bị bỏ qua (không import)
- File phải có header row
- Row thiếu `level` sẽ bị bỏ qua

---

### 8. Tải file mẫu (Template)

**GET** `/api/systemLevel/template`

Tải file Excel mẫu để import.

#### Response Success (200 OK)

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `system_levels_template.xlsx`

#### Nội dung file mẫu:

| Level | Description | Created By |
|-------|-------------|------------|
| Critical | Critical system level requiring immediate attention | admin |

#### cURL Example

```bash
curl -X GET "http://localhost:8080/api/systemLevel/template" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output template.xlsx
```

---

## 🔧 Data Models

### SystemLevel Object

```typescript
interface SystemLevel {
  id: number;              // ID tự tăng (BIGINT)
  level: string;           // Tên cấp độ (max 255 chars, unique)
  description: string;     // Mô tả (max 1000 chars, nullable)
  createdAt: string;       // ISO 8601 timestamp
  createdBy: string;       // Người tạo (max 255 chars, nullable)
  updatedAt: string;       // ISO 8601 timestamp
  updatedBy: string;       // Người cập nhật (max 255 chars, nullable)
}
```

### SystemLevelRequest

```typescript
interface SystemLevelRequest {
  level: string;           // Required, max 255 chars, unique
  description?: string;    // Optional, max 1000 chars
  createdBy?: string;      // Optional, max 255 chars
  updatedBy?: string;      // Optional, max 255 chars
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  content: T[];           // Mảng dữ liệu
  totalElements: number;  // Tổng số bản ghi
  totalPages: number;     // Tổng số trang
  currentPage: number;    // Trang hiện tại (1-based)
  pageSize: number;       // Số bản ghi mỗi trang
  hasNext: boolean;       // Có trang kế tiếp?
  hasPrevious: boolean;   // Có trang trước?
}
```

### API Response Wrapper

```typescript
interface ApiResponse<T> {
  success: boolean;       // true/false
  statusCode: number;     // HTTP status code
  message: string;        // Message
  data: T | null;        // Payload hoặc null nếu lỗi
}
```

---

## 🚨 Error Codes

| Status Code | Message | Description |
|-------------|---------|-------------|
| 200 | SUCCESS | Request thành công |
| 400 | Invalid parameters | Tham số không hợp lệ |
| 400 | System level already exists | Level đã tồn tại |
| 400 | Invalid file | File không hợp lệ |
| 400 | Unsupported file format | Format file không hỗ trợ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | System level not found | Không tìm thấy cấp độ với ID đã cho |
| 500 | Create system level fail | Lỗi khi tạo cấp độ |
| 500 | Update system level fail | Lỗi khi cập nhật cấp độ |
| 500 | Delete system level fail | Lỗi khi xóa cấp độ |
| 500 | Import system levels fail | Lỗi khi import |

---

## 💡 Frontend Integration Examples

### React/TypeScript Example

```typescript
// types/systemLevel.ts
export interface SystemLevel {
  id: number;
  level: string;
  description: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface SystemLevelRequest {
  level: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
}

// services/systemLevelService.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/systemLevel';

export const systemLevelService = {
  // Get all with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    keyWord?: string;
    sortDir?: 'asc' | 'desc';
    sortKey?: string;
  }) => {
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  },

  // Create
  create: async (data: SystemLevelRequest) => {
    const response = await axios.post(`${BASE_URL}/create`, data);
    return response.data;
  },

  // Update
  update: async (id: number, data: Partial<SystemLevelRequest>) => {
    const response = await axios.post(
      `${BASE_URL}/edit`,
      data,
      { params: { id } }
    );
    return response.data;
  },

  // Delete
  delete: async (ids: number[]) => {
    const response = await axios.post(
      `${BASE_URL}/delete`,
      null,
      { params: { ids: ids.join(',') } }
    );
    return response.data;
  },

  // Copy
  copy: async (id: number) => {
    const response = await axios.post(`${BASE_URL}/copy/${id}`);
    return response.data;
  },

  // Export to Excel
  exportToExcel: async () => {
    const response = await axios.get(`${BASE_URL}/export`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'system_levels_export.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Import from file
  importFromFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${BASE_URL}/import`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  },

  // Download template
  downloadTemplate: async () => {
    const response = await axios.get(`${BASE_URL}/template`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'system_levels_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

// components/SystemLevelList.tsx
import { useState, useEffect } from 'react';
import { systemLevelService, SystemLevel } from '../services/systemLevelService';

export const SystemLevelList = () => {
  const [levels, setLevels] = useState<SystemLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLevels();
  }, [page]);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const response = await systemLevelService.getAll({
        page,
        limit: 10,
        sortKey: 'level',
        sortDir: 'asc'
      });

      if (response.success) {
        setLevels(response.data.content);
      }
    } catch (error) {
      console.error('Failed to load system levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa cấp độ này?')) {
      try {
        await systemLevelService.delete([id]);
        loadLevels();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const handleCopy = async (id: number) => {
    try {
      await systemLevelService.copy(id);
      loadLevels();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await systemLevelService.importFromFile(file);
      alert(response.message);
      loadLevels();
    } catch (error) {
      console.error('Failed to import:', error);
    }
  };

  return (
    <div>
      <div className="actions">
        <button onClick={() => systemLevelService.exportToExcel()}>
          Export Excel
        </button>
        <button onClick={() => systemLevelService.downloadTemplate()}>
          Download Template
        </button>
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleImport}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Level</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.map(level => (
              <tr key={level.id}>
                <td>{level.id}</td>
                <td>{level.level}</td>
                <td>{level.description}</td>
                <td>
                  <button onClick={() => handleCopy(level.id)}>Copy</button>
                  <button onClick={() => handleDelete(level.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

### Vue 3 Example

```typescript
// composables/useSystemLevels.ts
import { ref } from 'vue';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/systemLevel';

export const useSystemLevels = () => {
  const levels = ref<SystemLevel[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchLevels = async (params?: {
    page?: number;
    limit?: number;
    keyWord?: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(BASE_URL, { params });
      if (response.data.success) {
        levels.value = response.data.data.content;
      }
    } catch (err) {
      error.value = 'Failed to fetch system levels';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createLevel = async (data: SystemLevelRequest) => {
    loading.value = true;
    try {
      const response = await axios.post(`${BASE_URL}/create`, data);
      if (response.data.success) {
        await fetchLevels();
        return response.data.data;
      }
    } catch (err) {
      error.value = 'Failed to create system level';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const copyLevel = async (id: number) => {
    loading.value = true;
    try {
      const response = await axios.post(`${BASE_URL}/copy/${id}`);
      if (response.data.success) {
        await fetchLevels();
        return response.data.data;
      }
    } catch (err) {
      error.value = 'Failed to copy system level';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const exportToExcel = async () => {
    const response = await axios.get(`${BASE_URL}/export`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'system_levels_export.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return {
    levels,
    loading,
    error,
    fetchLevels,
    createLevel,
    copyLevel,
    exportToExcel,
  };
};
```

---

## 📌 Business Rules Summary

Theo `crud-business-rule.md`, tất cả các tính năng sau đã được implement:

- ✅ Thêm mới đối tượng
- ✅ Sửa đối tượng
- ✅ Xóa đối tượng
- ✅ List all danh sách đối tượng (với phân trang)
- ✅ Filter (tìm kiếm gần đúng theo các trường)
- ✅ Xóa nhiều đối tượng
- ✅ Sao chép từ dữ liệu cũ để tự động fill
- ✅ Import danh sách từ file CSV, TXT, Excel
- ✅ Export file ra Excel
- ✅ Cho phép tải file mẫu

**API sử dụng chuẩn camelCase** ✓

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:
- Backend Team: backend@example.com
- Documentation: https://docs.example.com

---

**Last Updated:** 2025-01-15
**API Version:** 1.0
**Backend Version:** Spring Boot 2.x
