# API Documentation - Quản lý Loại vận hành (Operation Type Management)

## Base URL
```
http://localhost:8002/api/operation-type
```

## Authentication
Tất cả các API endpoint yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Lấy danh sách Loại vận hành (Get All Operation Types)

### Endpoint
```
GET /api/operation-type
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Integer | No | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | No | 10 | Số lượng items trên mỗi trang |
| keyWord | String | No | - | Từ khóa tìm kiếm (tìm trên code, name, description, note) |
| sort_dir | String | No | desc | Hướng sắp xếp: `asc` hoặc `desc` |
| sort_key | String | No | createdAt | Trường để sắp xếp: `id`, `operationTypeCode`, `operationTypeName`, `createdAt`, `updatedAt` |

### Request Example
```bash
curl -X GET "http://localhost:8002/api/operation-type?page=1&limit=10&keyWord=OS&sort_dir=desc&sort_key=createdAt" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "operationTypeCode": "OS",
        "operationTypeName": "Hệ điều hành (Operating System)",
        "description": "Quản lý các hệ điều hành như Windows, Linux, MacOS, Unix. Bao gồm việc cài đặt, cấu hình, bảo trì, và nâng cấp hệ điều hành.",
        "note": "Loại vận hành cơ bản cho mọi hệ thống",
        "createdAt": "2024-11-11T10:00:00.000Z",
        "createdBy": "system",
        "updatedAt": "2024-11-11T10:00:00.000Z",
        "updatedBy": "system"
      },
      {
        "id": 2,
        "operationTypeCode": "DATABASE",
        "operationTypeName": "Cơ sở dữ liệu (Database)",
        "description": "Quản lý các hệ quản trị cơ sở dữ liệu như PostgreSQL, MySQL, Oracle, MongoDB, SQL Server.",
        "note": "Quan trọng cho việc lưu trữ và quản lý dữ liệu",
        "createdAt": "2024-11-11T10:00:00.000Z",
        "createdBy": "system",
        "updatedAt": "2024-11-11T10:00:00.000Z",
        "updatedBy": "system"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 20,
    "totalPages": 2,
    "last": false,
    "first": true,
    "size": 10,
    "number": 0,
    "numberOfElements": 10
  }
}
```

---

## 2. Lấy chi tiết Loại vận hành theo ID (Get Operation Type by ID)

### Endpoint
```
GET /api/operation-type/{id}
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | Yes | ID của loại vận hành |

### Request Example
```bash
curl -X GET "http://localhost:8002/api/operation-type/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "success",
  "data": {
    "id": 1,
    "operationTypeCode": "OS",
    "operationTypeName": "Hệ điều hành (Operating System)",
    "description": "Quản lý các hệ điều hành như Windows, Linux, MacOS, Unix. Bao gồm việc cài đặt, cấu hình, bảo trì, và nâng cấp hệ điều hành.",
    "note": "Loại vận hành cơ bản cho mọi hệ thống",
    "createdAt": "2024-11-11T10:00:00.000Z",
    "createdBy": "system",
    "updatedAt": "2024-11-11T10:00:00.000Z",
    "updatedBy": "system"
  }
}
```

### Response Error (404 Not Found)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Operation type not found with ID: 999"
}
```

---

## 3. Tạo mới Loại vận hành (Create Operation Type)

### Endpoint
```
POST /api/operation-type/create
```

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

### Request Body
```json
{
  "operationTypeCode": "MOBILE_APP",
  "operationTypeName": "Ứng dụng di động (Mobile Apps)",
  "description": "Quản lý các ứng dụng di động trên iOS và Android",
  "note": "Bao gồm cả native và hybrid apps",
  "createdBy": "admin"
}
```

### Request Body Schema
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| operationTypeCode | String | **Yes** | 255 | Mã loại vận hành (unique) |
| operationTypeName | String | **Yes** | 255 | Tên loại vận hành |
| description | String | No | 1000 | Mô tả chi tiết |
| note | String | No | 1000 | Ghi chú bổ sung |
| createdBy | String | No | 255 | Người tạo |

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "success",
  "data": {
    "id": 21,
    "operationTypeCode": "MOBILE_APP",
    "operationTypeName": "Ứng dụng di động (Mobile Apps)",
    "description": "Quản lý các ứng dụng di động trên iOS và Android",
    "note": "Bao gồm cả native và hybrid apps",
    "createdAt": "2024-11-11T15:30:00.000Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-11T15:30:00.000Z",
    "updatedBy": null
  }
}
```

### Response Error (400 Bad Request)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Operation type code already exists: MOBILE_APP"
}
```

---

## 4. Cập nhật Loại vận hành (Update Operation Type)

### Endpoint
```
POST /api/operation-type/edit?id={id}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | **Yes** | ID của loại vận hành cần cập nhật |

### Request Body
```json
{
  "operationTypeCode": "MOBILE_APP",
  "operationTypeName": "Ứng dụng di động (Mobile Applications)",
  "description": "Quản lý các ứng dụng di động trên nền tảng iOS, Android và cross-platform",
  "note": "Bao gồm native, hybrid và PWA",
  "updatedBy": "admin"
}
```

### Request Example
```bash
curl -X POST "http://localhost:8002/api/operation-type/edit?id=21" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "operationTypeCode": "MOBILE_APP",
    "operationTypeName": "Ứng dụng di động (Mobile Applications)",
    "description": "Quản lý các ứng dụng di động trên nền tảng iOS, Android và cross-platform",
    "note": "Bao gồm native, hybrid và PWA",
    "updatedBy": "admin"
  }'
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "success",
  "data": {
    "id": 21,
    "operationTypeCode": "MOBILE_APP",
    "operationTypeName": "Ứng dụng di động (Mobile Applications)",
    "description": "Quản lý các ứng dụng di động trên nền tảng iOS, Android và cross-platform",
    "note": "Bao gồm native, hybrid và PWA",
    "createdAt": "2024-11-11T15:30:00.000Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-11T16:00:00.000Z",
    "updatedBy": "admin"
  }
}
```

---

## 5. Xóa Loại vận hành (Delete Operation Types)

### Endpoint
```
POST /api/operation-type/delete?ids={id1}&ids={id2}&ids={id3}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ids | Long[] | **Yes** | Danh sách ID cần xóa (có thể truyền nhiều ids) |

### Request Example
```bash
# Xóa 1 item
curl -X POST "http://localhost:8002/api/operation-type/delete?ids=21" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Xóa nhiều items
curl -X POST "http://localhost:8002/api/operation-type/delete?ids=21&ids=22&ids=23" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "success",
  "data": null
}
```

### Response Error (404 Not Found)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Operation type with ID 999 not found"
}
```

---

## 6. Sao chép Loại vận hành (Copy Operation Type)

### Endpoint
```
POST /api/operation-type/copy?id={id}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Long | **Yes** | ID của loại vận hành nguồn để sao chép |

### Request Body
```json
{
  "operationTypeCode": "OS_LINUX",
  "operationTypeName": "Hệ điều hành Linux",
  "description": "Quản lý các hệ điều hành Linux như Ubuntu, CentOS, RedHat",
  "note": "Chỉ tập trung vào Linux distributions",
  "createdBy": "admin"
}
```

**Lưu ý:**
- Chỉ cần truyền `operationTypeCode` mới là bắt buộc
- Các trường khác (name, description, note) nếu không truyền sẽ tự động copy từ nguồn

### Request Example
```bash
curl -X POST "http://localhost:8002/api/operation-type/copy?id=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "operationTypeCode": "OS_LINUX",
    "operationTypeName": "Hệ điều hành Linux",
    "createdBy": "admin"
  }'
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation type copied successfully",
  "data": {
    "id": 22,
    "operationTypeCode": "OS_LINUX",
    "operationTypeName": "Hệ điều hành Linux",
    "description": "Quản lý các hệ điều hành như Windows, Linux, MacOS, Unix. Bao gồm việc cài đặt, cấu hình, bảo trì, và nâng cấp hệ điều hành.",
    "note": "Loại vận hành cơ bản cho mọi hệ thống",
    "createdAt": "2024-11-11T16:30:00.000Z",
    "createdBy": "admin",
    "updatedAt": "2024-11-11T16:30:00.000Z",
    "updatedBy": null
  }
}
```

---

## 7. Import từ Excel (Import from Excel)

### Endpoint
```
POST /api/operation-type/import
```

### Request Headers
```
Content-Type: multipart/form-data
Authorization: Bearer <your_jwt_token>
```

### Request Body (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | **Yes** | File Excel (.xlsx) chứa dữ liệu |

### Excel File Format
File Excel phải có các cột theo thứ tự:
1. **Mã loại vận hành*** (required)
2. **Tên loại vận hành*** (required)
3. Mô tả
4. Ghi chú
5. Người tạo

**Ví dụ:**
| Mã loại vận hành* | Tên loại vận hành* | Mô tả | Ghi chú | Người tạo |
|-------------------|-------------------|-------|---------|-----------|
| IOT | Internet of Things | Quản lý các thiết bị IoT | Bao gồm sensors, smart devices | admin |
| BLOCKCHAIN | Blockchain | Quản lý hệ thống blockchain | Bao gồm cả private và public blockchain | admin |

### Request Example (JavaScript/Axios)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

axios.post('http://localhost:8002/api/operation-type/import', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

### Response Success (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Imported 2 operation type(s) successfully",
  "data": [
    {
      "id": 23,
      "operationTypeCode": "IOT",
      "operationTypeName": "Internet of Things",
      "description": "Quản lý các thiết bị IoT",
      "note": "Bao gồm sensors, smart devices",
      "createdAt": "2024-11-11T17:00:00.000Z",
      "createdBy": "admin",
      "updatedAt": "2024-11-11T17:00:00.000Z",
      "updatedBy": null
    },
    {
      "id": 24,
      "operationTypeCode": "BLOCKCHAIN",
      "operationTypeName": "Blockchain",
      "description": "Quản lý hệ thống blockchain",
      "note": "Bao gồm cả private và public blockchain",
      "createdAt": "2024-11-11T17:00:00.000Z",
      "createdBy": "admin",
      "updatedAt": "2024-11-11T17:00:00.000Z",
      "updatedBy": null
    }
  ]
}
```

### Response Error (400 Bad Request)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Import failed: Row 3: Operation type code already exists: IOT",
  "data": null
}
```

---

## 8. Export ra Excel (Export to Excel)

### Endpoint
```
GET /api/operation-type/export
```

### Request Example
```bash
curl -X GET "http://localhost:8002/api/operation-type/export" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o operation_types.xlsx
```

### Request Example (JavaScript/Axios)
```javascript
axios.get('http://localhost:8002/api/operation-type/export', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  responseType: 'blob'
})
.then(response => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `operation_types_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
})
.catch(error => console.error(error));
```

### Response
File Excel (.xlsx) chứa tất cả dữ liệu với các cột:
- Mã loại vận hành
- Tên loại vận hành
- Mô tả
- Ghi chú
- Người tạo
- Thời gian tạo
- Người cập nhật
- Thời gian cập nhật

---

## 9. Tải template Excel (Download Template)

### Endpoint
```
GET /api/operation-type/template
```

### Request Example
```bash
curl -X GET "http://localhost:8002/api/operation-type/template" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o operation_types_template.xlsx
```

### Request Example (JavaScript/Axios)
```javascript
axios.get('http://localhost:8002/api/operation-type/template', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  responseType: 'blob'
})
.then(response => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'operation_types_template.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
})
.catch(error => console.error(error));
```

### Response
File Excel template với:
- Header row với tên các cột
- 1 dòng dữ liệu mẫu để tham khảo format

---

## Error Responses

### Common Error Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Bad Request - Dữ liệu không hợp lệ | Thiếu trường bắt buộc, format sai |
| 401 | Unauthorized - Chưa đăng nhập | Token không hợp lệ hoặc hết hạn |
| 403 | Forbidden - Không có quyền | User không có quyền thực hiện thao tác |
| 404 | Not Found - Không tìm thấy | ID không tồn tại |
| 500 | Internal Server Error | Lỗi server |

### Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Chi tiết lỗi ở đây",
  "data": null
}
```

---

## Frontend Integration Examples

### React/TypeScript Example

```typescript
// api/operationType.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8002/api/operation-type';

export interface OperationType {
  id: number;
  operationTypeCode: string;
  operationTypeName: string;
  description?: string;
  note?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface OperationTypeRequest {
  operationTypeCode: string;
  operationTypeName: string;
  description?: string;
  note?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Get all operation types
export const getAllOperationTypes = async (
  page: number = 1,
  limit: number = 10,
  keyWord?: string,
  sortDir: 'asc' | 'desc' = 'desc',
  sortKey: string = 'createdAt'
) => {
  const response = await axios.get<{ data: PaginationResponse<OperationType> }>(
    BASE_URL,
    {
      params: { page, limit, keyWord, sort_dir: sortDir, sort_key: sortKey },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data.data;
};

// Get operation type by ID
export const getOperationTypeById = async (id: number) => {
  const response = await axios.get<{ data: OperationType }>(
    `${BASE_URL}/${id}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  return response.data.data;
};

// Create operation type
export const createOperationType = async (data: OperationTypeRequest) => {
  const response = await axios.post<{ data: OperationType }>(
    `${BASE_URL}/create`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data.data;
};

// Update operation type
export const updateOperationType = async (id: number, data: OperationTypeRequest) => {
  const response = await axios.post<{ data: OperationType }>(
    `${BASE_URL}/edit`,
    data,
    {
      params: { id },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data.data;
};

// Delete operation types
export const deleteOperationTypes = async (ids: number[]) => {
  await axios.post(
    `${BASE_URL}/delete`,
    null,
    {
      params: { ids },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
};

// Copy operation type
export const copyOperationType = async (id: number, data: OperationTypeRequest) => {
  const response = await axios.post<{ data: OperationType }>(
    `${BASE_URL}/copy`,
    data,
    {
      params: { id },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data.data;
};

// Import from Excel
export const importFromExcel = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<{ data: OperationType[] }>(
    `${BASE_URL}/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data.data;
};

// Export to Excel
export const exportToExcel = async () => {
  const response = await axios.get(`${BASE_URL}/export`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `operation_types_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Download template
export const downloadTemplate = async () => {
  const response = await axios.get(`${BASE_URL}/template`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'operation_types_template.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

### React Component Example

```typescript
// components/OperationTypeList.tsx
import React, { useState, useEffect } from 'react';
import { getAllOperationTypes, deleteOperationTypes, OperationType } from '../api/operationType';

const OperationTypeList: React.FC = () => {
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllOperationTypes(page, 10, keyword);
      setOperationTypes(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching operation types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, keyword]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await deleteOperationTypes([id]);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  return (
    <div>
      <h1>Quản lý Loại vận hành</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {operationTypes.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.operationTypeCode}</td>
                <td>{item.operationTypeName}</td>
                <td>{item.description}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default OperationTypeList;
```

---

## Swagger UI

Để test API trực tiếp, truy cập Swagger UI tại:
```
http://localhost:8002/swagger-ui.html
```

Tìm section **"Operation Type Management"** để xem và test tất cả các endpoints.

---

## Notes
- Tất cả timestamp đều theo định dạng ISO 8601 (UTC): `2024-11-11T10:00:00.000Z`
- ID là số nguyên tự động tăng (BIGSERIAL)
- Field `operationTypeCode` phải unique trong toàn bộ hệ thống
- Khi import Excel, nếu có lỗi ở một số dòng, các dòng hợp lệ vẫn được import
- Export Excel sẽ xuất tất cả dữ liệu (không có pagination)
