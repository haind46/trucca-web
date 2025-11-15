# API Department - Quản lý Đơn vị/Phòng ban

## Thông tin chung

**Base URL:** `http://localhost:8002/api/department`

**Version:** 2.0 (Updated: 2025-01-15)

**Authentication:** Required (JWT Token)

---

## 📝 Breaking Changes v2.0

### Thay đổi quan trọng từ phiên bản cũ:

| Field | Version 1.x | Version 2.0 | Lý do |
|-------|-------------|-------------|-------|
| `id` | `string` (UUID) | `number` (BIGINT) | Chuyển sang auto-increment ID |
| `desc` | `string` | `description` | Đổi tên field cho rõ nghĩa |
| `deptCode` | max 255 chars | max 50 chars | Tối ưu database |

### Migration Notes:
- Tất cả department IDs hiện tại sẽ được chuyển thành số tự tăng (1, 2, 3, ...)
- API requests/responses phải sử dụng `number` cho `id`
- Field `desc` đã đổi thành `description`

---

## 📚 Endpoints

### 1. Lấy danh sách đơn vị (Paginated)

**GET** `/api/department`

Lấy danh sách đơn vị với phân trang, tìm kiếm và sắp xếp.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Số trang (bắt đầu từ 1) |
| `limit` | number | No | 10 | Số bản ghi mỗi trang |
| `keyWord` | string | No | - | Từ khóa tìm kiếm (tìm trong name, dept_code, description) |
| `sort_dir` | string | No | desc | Hướng sắp xếp: `asc` hoặc `desc` |
| `sort_key` | string | No | id | Trường sắp xếp: `id`, `name`, `dept_code`, `created_at` |

#### Request Example

```bash
# Lấy trang 1, 10 bản ghi
GET /api/department?page=1&limit=10

# Tìm kiếm "IT"
GET /api/department?keyWord=IT

# Sắp xếp theo tên tăng dần
GET /api/department?sort_key=name&sort_dir=asc

# Kết hợp: tìm kiếm + phân trang + sắp xếp
GET /api/department?page=2&limit=20&keyWord=phòng&sort_key=dept_code&sort_dir=desc
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
        "name": "Phòng IT",
        "deptCode": "IT",
        "description": "Phòng Công nghệ thông tin",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "Phòng Kỹ thuật",
        "deptCode": "KT",
        "description": "Phòng Kỹ thuật",
        "createdAt": "2024-01-15T11:00:00Z"
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

#### Response Error (400 Bad Request)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid parameters",
  "data": null
}
```

---

### 2. Tạo đơn vị mới

**POST** `/api/department/create`

Tạo một đơn vị/phòng ban mới.

#### Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "name": "Phòng Nhân sự",
  "deptCode": "HR",
  "description": "Phòng Quản lý Nhân sự"
}
```

#### Request Body Schema

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 255 | Tên đơn vị |
| `deptCode` | string | Yes | 50 | Mã đơn vị (phải unique) |
| `description` | string | No | 255 | Mô tả đơn vị |

#### Validation Rules

- `name`: Không được để trống, tối đa 255 ký tự
- `deptCode`: Không được để trống, tối đa 50 ký tự, phải unique trong hệ thống
- `description`: Tùy chọn, tối đa 255 ký tự

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SUCCESS",
  "data": {
    "id": 6,
    "name": "Phòng Nhân sự",
    "deptCode": "HR",
    "description": "Phòng Quản lý Nhân sự",
    "createdAt": "2024-01-15T14:25:30Z"
  }
}
```

#### Response Error (400 Bad Request)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed: deptCode already exists",
  "data": null
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8002/api/department/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Phòng Nhân sự",
    "deptCode": "HR",
    "description": "Phòng Quản lý Nhân sự"
  }'
```

---

### 3. Cập nhật đơn vị

**POST** `/api/department/edit`

Cập nhật thông tin đơn vị/phòng ban.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của đơn vị cần cập nhật |

#### Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "name": "Phòng IT - Updated",
  "deptCode": "IT_NEW",
  "description": "Phòng Công nghệ thông tin - Đã cập nhật"
}
```

#### Request Body Schema

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | No | 255 | Tên đơn vị mới |
| `deptCode` | string | No | 50 | Mã đơn vị mới (phải unique) |
| `description` | string | No | 255 | Mô tả mới |

**Lưu ý:** Chỉ gửi các field cần cập nhật. Các field không gửi sẽ giữ nguyên giá trị cũ.

#### Response Success (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "SUCCESS",
  "data": {
    "id": 1,
    "name": "Phòng IT - Updated",
    "deptCode": "IT_NEW",
    "description": "Phòng Công nghệ thông tin - Đã cập nhật",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Department not found",
  "data": null
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:8002/api/department/edit?id=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Phòng IT - Updated",
    "description": "Phòng Công nghệ thông tin - Đã cập nhật"
  }'
```

---

### 4. Xóa đơn vị

**POST** `/api/department/delete`

Xóa một hoặc nhiều đơn vị/phòng ban.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | number[] | Yes | Danh sách IDs cần xóa (phân cách bằng dấu phẩy) |

#### Request Headers

```
Authorization: Bearer <token>
```

#### Request Example

```bash
# Xóa 1 department
POST /api/department/delete?ids=5

# Xóa nhiều departments
POST /api/department/delete?ids=3,4,5
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

#### Response Error (404 Not Found)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Department with ID 999 not found",
  "data": null
}
```

#### cURL Example

```bash
# Xóa 1 department
curl -X POST "http://localhost:8002/api/department/delete?ids=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xóa nhiều departments
curl -X POST "http://localhost:8002/api/department/delete?ids=3,4,5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Lưu ý quan trọng

- Khi xóa department, tất cả users thuộc department đó sẽ có `department = null`
- Không thể xóa nếu có constraint violations
- Xóa là vĩnh viễn, không thể khôi phục

---

## 🔧 Data Models

### Department Object

```typescript
interface Department {
  id: number;              // ID tự tăng (BIGINT)
  name: string;            // Tên đơn vị (max 255 chars)
  deptCode: string;        // Mã đơn vị, unique (max 50 chars)
  description: string;     // Mô tả (max 255 chars, nullable)
  createdAt: string;       // ISO 8601 timestamp
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
  message: string;        // Message (SUCCESS, error message, etc.)
  data: T | null;        // Payload hoặc null nếu lỗi
}
```

---

## 🚨 Error Codes

| Status Code | Message | Description |
|-------------|---------|-------------|
| 200 | SUCCESS | Request thành công |
| 400 | Invalid parameters | Tham số không hợp lệ |
| 400 | Validation failed | Dữ liệu không đúng định dạng |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Department not found | Không tìm thấy đơn vị với ID đã cho |
| 500 | Create department fail | Lỗi khi tạo đơn vị |
| 500 | Update department fail | Lỗi khi cập nhật đơn vị |
| 500 | Delete department fail | Lỗi khi xóa đơn vị |

---

## 💡 Frontend Integration Examples

### React/TypeScript Example

```typescript
// types/department.ts
export interface Department {
  id: number;
  name: string;
  deptCode: string;
  description: string | null;
  createdAt: string;
}

export interface DepartmentRequest {
  name: string;
  deptCode: string;
  description?: string;
}

export interface PaginatedDepartments {
  content: Department[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// services/departmentService.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8002/api/department';

export const departmentService = {
  // Get all departments with pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    keyWord?: string;
    sort_dir?: 'asc' | 'desc';
    sort_key?: string;
  }) => {
    const response = await axios.get<ApiResponse<PaginatedDepartments>>(
      BASE_URL,
      { params }
    );
    return response.data;
  },

  // Create department
  create: async (data: DepartmentRequest) => {
    const response = await axios.post<ApiResponse<Department>>(
      `${BASE_URL}/create`,
      data
    );
    return response.data;
  },

  // Update department
  update: async (id: number, data: Partial<DepartmentRequest>) => {
    const response = await axios.post<ApiResponse<Department>>(
      `${BASE_URL}/edit`,
      data,
      { params: { id } }
    );
    return response.data;
  },

  // Delete departments
  delete: async (ids: number[]) => {
    const response = await axios.post<ApiResponse<null>>(
      `${BASE_URL}/delete`,
      null,
      { params: { ids: ids.join(',') } }
    );
    return response.data;
  },
};

// components/DepartmentList.tsx
import { useEffect, useState } from 'react';
import { departmentService, Department } from '../services/departmentService';

export const DepartmentList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadDepartments();
  }, [page]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentService.getAll({
        page,
        limit: 10,
        sort_key: 'name',
        sort_dir: 'asc'
      });

      if (response.success) {
        setDepartments(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn vị này?')) {
      try {
        const response = await departmentService.delete([id]);
        if (response.success) {
          loadDepartments(); // Reload list
        }
      } catch (error) {
        console.error('Failed to delete department:', error);
      }
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mã</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id}>
                <td>{dept.id}</td>
                <td>{dept.name}</td>
                <td>{dept.deptCode}</td>
                <td>{dept.description}</td>
                <td>
                  <button onClick={() => handleDelete(dept.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div>
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### Vue 3 Example

```typescript
// composables/useDepartments.ts
import { ref } from 'vue';
import axios from 'axios';

const BASE_URL = 'http://localhost:8002/api/department';

export const useDepartments = () => {
  const departments = ref<Department[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchDepartments = async (params?: {
    page?: number;
    limit?: number;
    keyWord?: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(BASE_URL, { params });
      if (response.data.success) {
        departments.value = response.data.data.content;
      }
    } catch (err) {
      error.value = 'Failed to fetch departments';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createDepartment = async (data: DepartmentRequest) => {
    loading.value = true;
    try {
      const response = await axios.post(`${BASE_URL}/create`, data);
      if (response.data.success) {
        await fetchDepartments(); // Reload list
        return response.data.data;
      }
    } catch (err) {
      error.value = 'Failed to create department';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDepartment = async (ids: number[]) => {
    loading.value = true;
    try {
      const response = await axios.post(
        `${BASE_URL}/delete`,
        null,
        { params: { ids: ids.join(',') } }
      );
      if (response.data.success) {
        await fetchDepartments(); // Reload list
      }
    } catch (err) {
      error.value = 'Failed to delete department';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    deleteDepartment,
  };
};
```

### Angular Example

```typescript
// services/department.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private baseUrl = 'http://localhost:8002/api/department';

  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    keyWord?: string;
    sort_dir?: string;
    sort_key?: string;
  }): Observable<ApiResponse<PaginatedDepartments>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedDepartments>>(
      this.baseUrl,
      { params: httpParams }
    );
  }

  create(data: DepartmentRequest): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(
      `${this.baseUrl}/create`,
      data
    );
  }

  update(id: number, data: Partial<DepartmentRequest>): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(
      `${this.baseUrl}/edit`,
      data,
      { params: { id: id.toString() } }
    );
  }

  delete(ids: number[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.baseUrl}/delete`,
      null,
      { params: { ids: ids.join(',') } }
    );
  }
}
```

---

## 🧪 Testing

### Jest Test Example

```typescript
import { departmentService } from './departmentService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DepartmentService', () => {
  it('should fetch departments successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          content: [
            { id: 1, name: 'IT', deptCode: 'IT', description: 'IT Dept' }
          ],
          totalElements: 1,
          totalPages: 1,
          currentPage: 1
        }
      }
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await departmentService.getAll();
    expect(result.success).toBe(true);
    expect(result.data.content).toHaveLength(1);
  });

  it('should create department successfully', async () => {
    const newDept = {
      name: 'HR',
      deptCode: 'HR',
      description: 'HR Department'
    };

    const mockResponse = {
      data: {
        success: true,
        data: { id: 2, ...newDept }
      }
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await departmentService.create(newDept);
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(2);
  });
});
```

---

## 📌 Notes

1. **ID Type Changed:** Department IDs are now `number` (BIGINT) instead of `string` (UUID)
2. **Auto-increment:** IDs are automatically generated, don't include `id` in create requests
3. **Unique Constraint:** `deptCode` must be unique across all departments
4. **Cascade Delete:** Deleting a department sets `department = null` for all related users
5. **Search:** The `keyWord` parameter searches across `name`, `deptCode`, and `description` fields
6. **Case-insensitive Search:** Search uses `ILIKE` operator (PostgreSQL)

---

## 🔗 Related APIs

- [User API](./API_User.md) - Users có field `department: number` tham chiếu đến Department
- [User Group API](./API_UserGroup.md) - Quản lý nhóm người dùng

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:
- Backend Team: backend@example.com
- Documentation: https://docs.example.com

---

**Last Updated:** 2025-01-15
**API Version:** 2.0
**Backend Version:** Spring Boot 2.x
