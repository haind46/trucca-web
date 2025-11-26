# SYS_SEVERITY API - FRONTEND INTEGRATION GUIDE

**Version:** 1.0
**Base URL:** `http://localhost:8002/api/sys-severity`
**Ngày tạo:** 2025-11-25

---

## 📋 MỤC LỤC

1. [Quick Start](#1-quick-start)
2. [TypeScript Interfaces](#2-typescript-interfaces)
3. [API Endpoints](#3-api-endpoints)
4. [React Examples](#4-react-examples)
5. [Vue Examples](#5-vue-examples)
6. [Error Handling](#6-error-handling)
7. [Best Practices](#7-best-practices)

---

## 1. QUICK START

### 1.1 Base Configuration

```typescript
// api/config.ts
export const API_BASE_URL = 'http://localhost:8002';
export const API_ENDPOINTS = {
  SYS_SEVERITY: {
    BASE: '/api/sys-severity',
    LIST: '/api/sys-severity',
    GET_BY_CODE: (code: string) => `/api/sys-severity/${code}`,
    ACTIVE: '/api/sys-severity/active',
    CREATE: '/api/sys-severity/create',
    EDIT: '/api/sys-severity/edit',
    DELETE: '/api/sys-severity/delete',
    COPY: '/api/sys-severity/copy',
    EXPORT: '/api/sys-severity/export',
    IMPORT: '/api/sys-severity/import',
    TEMPLATE: '/api/sys-severity/template',
  }
};
```

### 1.2 Axios Setup

```typescript
// api/axios.ts
import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (thêm token nếu cần)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 2. TYPESCRIPT INTERFACES

### 2.1 Core Interfaces

```typescript
// types/sys-severity.ts

/**
 * Severity Configuration Object
 */
export interface SysSeverity {
  id: string;

  // Severity Info
  severityCode: string;        // DOWN, CRITICAL, MAJOR, MINOR, WARNING
  severityName: string;        // Tên hiển thị
  description?: string;        // Mô tả chi tiết

  // UI Display
  colorCode?: string;          // #FF0000, #FFFF00
  iconName?: string;           // alert-circle, alert-triangle
  priorityLevel: number;       // 1-5 (5 cao nhất)
  displayOrder: number;        // Thứ tự hiển thị

  // Notification Config
  notifyToLevel?: number;      // 1-5 (thông báo đến cấp nào)
  autoCall: boolean;           // Gọi điện tự động
  ttsTemplate?: string;        // Mẫu Text-to-Speech

  // Clear Config
  autoClearEnabled: boolean;
  clearStrategy: ClearStrategy;
  clearCycleCount?: number;
  clearTimeoutMinutes?: number;
  clearNotificationEnabled: boolean;
  clearTtsTemplate?: string;

  // Alert Frequency
  repeatCount?: number;        // Số lần nhắc (null = vô hạn)
  intervalMinutes: number;     // Khoảng cách giữa các lần nhắc

  // Status
  isActive: boolean;

  // Metadata
  createdAt: string;           // ISO 8601
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Clear Strategy Enum
 */
export type ClearStrategy =
  | 'AUTO_CYCLE'      // Clear khi N chu kỳ liên tiếp bình thường
  | 'AUTO_TIMEOUT'    // Clear khi không vi phạm trong X phút
  | 'MANUAL'          // Chỉ Clear thủ công
  | 'HYBRID'          // Kết hợp CYCLE và TIMEOUT
  | 'AUTO_RECOVERY';  // Clear ngay khi phục hồi

/**
 * Request DTO cho Create/Edit
 */
export interface SysSeverityRequest {
  severityCode: string;
  severityName: string;
  description?: string;
  colorCode?: string;
  iconName?: string;
  priorityLevel: number;
  displayOrder?: number;
  notifyToLevel?: number;
  autoCall?: boolean;
  ttsTemplate?: string;
  autoClearEnabled?: boolean;
  clearStrategy?: ClearStrategy;
  clearCycleCount?: number;
  clearTimeoutMinutes?: number;
  clearNotificationEnabled?: boolean;
  clearTtsTemplate?: string;
  repeatCount?: number;
  intervalMinutes?: number;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];            // Array of items
    total: number;        // Total count
    page: number;         // Current page (0-indexed)
    size: number;         // Items per page
  };
  message: string;
  statusCode: number;
}

/**
 * Single Item Response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

/**
 * List Query Parameters
 */
export interface SeverityListParams {
  page?: number;           // 1-indexed (frontend gửi 1, 2, 3...)
  limit?: number;          // Default: 10
  keyword?: string;        // Tìm kiếm
  sort_dir?: 'asc' | 'desc';  // Default: asc
  sort_key?: string;       // Default: displayOrder
}
```

### 2.2 Form Validation

```typescript
// validation/severity-validation.ts
import * as Yup from 'yup';

export const severityValidationSchema = Yup.object().shape({
  severityCode: Yup.string()
    .required('Mã severity là bắt buộc')
    .max(20, 'Mã severity tối đa 20 ký tự')
    .matches(/^[A-Z_]+$/, 'Mã severity chỉ chứa chữ IN HOA và dấu _'),

  severityName: Yup.string()
    .required('Tên severity là bắt buộc')
    .max(100, 'Tên severity tối đa 100 ký tự'),

  description: Yup.string()
    .nullable(),

  colorCode: Yup.string()
    .nullable()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Mã màu phải theo format #RRGGBB'),

  priorityLevel: Yup.number()
    .required('Mức ưu tiên là bắt buộc')
    .min(1, 'Mức ưu tiên từ 1-5')
    .max(5, 'Mức ưu tiên từ 1-5'),

  notifyToLevel: Yup.number()
    .nullable()
    .min(1, 'Cấp thông báo từ 1-5')
    .max(5, 'Cấp thông báo từ 1-5'),

  clearStrategy: Yup.string()
    .oneOf(['AUTO_CYCLE', 'AUTO_TIMEOUT', 'MANUAL', 'HYBRID', 'AUTO_RECOVERY']),

  clearCycleCount: Yup.number()
    .nullable()
    .min(1, 'Số chu kỳ phải >= 1'),

  clearTimeoutMinutes: Yup.number()
    .nullable()
    .min(1, 'Timeout phải >= 1 phút'),

  intervalMinutes: Yup.number()
    .required('Khoảng cách nhắc là bắt buộc')
    .min(1, 'Khoảng cách nhắc phải >= 1 phút'),
});
```

---

## 3. API ENDPOINTS

### 3.1 GET /api/sys-severity - Lấy danh sách

**Request:**
```typescript
const params: SeverityListParams = {
  page: 1,              // 1-indexed
  limit: 10,
  keyword: 'CRITICAL',  // Optional
  sort_dir: 'asc',
  sort_key: 'displayOrder'
};

const response = await apiClient.get<PaginatedResponse<SysSeverity>>(
  '/api/sys-severity',
  { params }
);
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/api/sys-severity?page=1&limit=10&keyword=CRITICAL&sort_dir=asc&sort_key=displayOrder" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "severityCode": "CRITICAL",
        "severityName": "Nghiêm trọng",
        "description": "Sự cố nghiêm trọng",
        "colorCode": "#EF4444",
        "iconName": "alert-circle",
        "priorityLevel": 4,
        "displayOrder": 2,
        "notifyToLevel": 4,
        "autoCall": true,
        "ttsTemplate": "Cảnh báo nghiêm trọng: {error_type}",
        "autoClearEnabled": true,
        "clearStrategy": "HYBRID",
        "clearCycleCount": 2,
        "clearTimeoutMinutes": 10,
        "clearNotificationEnabled": true,
        "clearTtsTemplate": "Đã giải quyết",
        "repeatCount": 10,
        "intervalMinutes": 10,
        "isActive": true,
        "createdAt": "2025-11-25T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 0,      // Backend trả về 0-indexed
    "size": 10
  },
  "message": "Success",
  "statusCode": 200
}
```

**⚠️ LƯU Ý:**
- Frontend gửi `page=1` (1-indexed)
- Backend trả về `page=0` (0-indexed)
- Frontend cần convert lại khi hiển thị: `displayPage = page + 1`

---

### 3.2 GET /api/sys-severity/{code} - Lấy theo code

**Request:**
```typescript
const code = 'CRITICAL';
const response = await apiClient.get<ApiResponse<SysSeverity>>(
  `/api/sys-severity/${code}`
);
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/api/sys-severity/CRITICAL" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "severityCode": "CRITICAL",
    ...
  },
  "message": "Success",
  "statusCode": 200
}
```

**Error Response (404):**
```json
{
  "success": false,
  "data": null,
  "message": "SysSeverity not found with code: INVALID_CODE",
  "statusCode": 404
}
```

---

### 3.3 GET /api/sys-severity/active - Lấy danh sách active

**Request:**
```typescript
const response = await apiClient.get<ApiResponse<SysSeverity[]>>(
  '/api/sys-severity/active'
);
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/api/sys-severity/active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "severityCode": "DOWN",
      "severityName": "Ngừng hoạt động",
      "displayOrder": 1,
      ...
    },
    {
      "id": "...",
      "severityCode": "CRITICAL",
      "severityName": "Nghiêm trọng",
      "displayOrder": 2,
      ...
    }
  ],
  "message": "Success",
  "statusCode": 200
}
```

**Use Case:**
- Dropdown chọn severity khi tạo alert
- Filter severity trong dashboard

---

### 3.4 POST /api/sys-severity/create - Tạo mới

**Request:**
```typescript
const payload: SysSeverityRequest = {
  severityCode: 'CUSTOM',
  severityName: 'Tùy chỉnh',
  description: 'Mức độ tùy chỉnh',
  colorCode: '#9333EA',
  iconName: 'alert',
  priorityLevel: 3,
  displayOrder: 10,
  notifyToLevel: 2,
  autoCall: false,
  ttsTemplate: 'Cảnh báo: {message}',
  autoClearEnabled: true,
  clearStrategy: 'AUTO_TIMEOUT',
  clearTimeoutMinutes: 20,
  clearNotificationEnabled: false,
  repeatCount: 5,
  intervalMinutes: 15,
  isActive: true,
  createdBy: 'user123'
};

const response = await apiClient.post<ApiResponse<SysSeverity>>(
  '/api/sys-severity/create',
  payload
);
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/api/sys-severity/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "severityCode": "CUSTOM",
    "severityName": "Tùy chỉnh",
    "priorityLevel": 3,
    "autoCall": false,
    "autoClearEnabled": true,
    "clearStrategy": "AUTO_TIMEOUT",
    "intervalMinutes": 15,
    "isActive": true
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "severityCode": "CUSTOM",
    ...
    "createdAt": "2025-11-25T10:30:00Z"
  },
  "message": "Success",
  "statusCode": 200
}
```

**Error Response (400 - Duplicate):**
```json
{
  "success": false,
  "data": null,
  "message": "SeverityCode already exists: CUSTOM",
  "statusCode": 400
}
```

**Error Response (400 - Validation):**
```json
{
  "success": false,
  "data": {
    "severityCode": "Severity code is required",
    "priorityLevel": "Priority level must be between 1 and 5"
  },
  "message": "Validation failed",
  "statusCode": 400
}
```

---

### 3.5 POST /api/sys-severity/edit - Cập nhật

**Request:**
```typescript
const id = '550e8400-e29b-41d4-a716-446655440000';
const payload: Partial<SysSeverityRequest> = {
  severityName: 'Nghiêm trọng (Updated)',
  description: 'Mô tả mới',
  priorityLevel: 5,
  updatedBy: 'user123'
};

const response = await apiClient.post<ApiResponse<SysSeverity>>(
  `/api/sys-severity/edit?id=${id}`,
  payload
);
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/api/sys-severity/edit?id=550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "severityName": "Nghiêm trọng (Updated)",
    "priorityLevel": 5
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "severityCode": "CRITICAL",
    "severityName": "Nghiêm trọng (Updated)",
    ...
    "updatedAt": "2025-11-25T11:00:00Z"
  },
  "message": "Success",
  "statusCode": 200
}
```

**⚠️ LƯU Ý:**
- Chỉ gửi các field cần update (partial update)
- Không thể update `id`, `createdAt`, `createdBy`

---

### 3.6 POST /api/sys-severity/delete - Xóa

**Request (Xóa 1):**
```typescript
const id = '550e8400-e29b-41d4-a716-446655440000';
const response = await apiClient.post<ApiResponse<null>>(
  '/api/sys-severity/delete',
  null,
  { params: { ids: [id] } }
);
```

**Request (Xóa nhiều):**
```typescript
const ids = [
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440001',
];
const response = await apiClient.post<ApiResponse<null>>(
  '/api/sys-severity/delete',
  null,
  { params: { ids } }
);
```

**cURL Example (Xóa 1):**
```bash
curl -X POST "http://localhost:8002/api/sys-severity/delete?ids=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**cURL Example (Xóa nhiều):**
```bash
curl -X POST "http://localhost:8002/api/sys-severity/delete?ids=uuid1,uuid2,uuid3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Success",
  "statusCode": 200
}
```

**Error Response (404):**
```json
{
  "success": false,
  "data": null,
  "message": "SysSeverity with ID uuid-not-found not found",
  "statusCode": 404
}
```

---

### 3.7 POST /api/sys-severity/copy - Sao chép

**Request:**
```typescript
const id = '550e8400-e29b-41d4-a716-446655440000';
const response = await apiClient.post<ApiResponse<SysSeverity>>(
  '/api/sys-severity/copy',
  null,
  { params: { id } }
);
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/api/sys-severity/copy?id=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "severityCode": "CRITICAL_copy",      // Tự động thêm "_copy"
    "severityName": "Nghiêm trọng (Copy)", // Tự động thêm " (Copy)"
    "isActive": false,                     // Inactive by default
    ...
  },
  "message": "Copied successfully",
  "statusCode": 200
}
```

**⚠️ LƯU Ý:**
- Object copy có `isActive = false` mặc định
- Cần edit để kích hoạt

---

### 3.8 GET /api/sys-severity/export - Xuất Excel

**Request:**
```typescript
const response = await apiClient.get('/api/sys-severity/export', {
  responseType: 'blob'
});

// Download file
const url = window.URL.createObjectURL(new Blob([response]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'sys_severity_export.xlsx');
document.body.appendChild(link);
link.click();
link.remove();
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/api/sys-severity/export" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output sys_severity_export.xlsx
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Binary data (Excel file)

---

### 3.9 POST /api/sys-severity/import - Nhập từ Excel

**Request:**
```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<SysSeverity[]>>(
    '/api/sys-severity/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response;
};
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/api/sys-severity/import" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/severities.xlsx"
```

**Success Response:**
```json
{
  "success": true,
  "data": [
    { imported objects... }
  ],
  "message": "Imported 10 items",
  "statusCode": 200
}
```

**Error Response (400):**
```json
{
  "success": false,
  "data": null,
  "message": "Import fail: Invalid file format",
  "statusCode": 400
}
```

---

### 3.10 GET /api/sys-severity/template - Tải template Excel

**Request:**
```typescript
const response = await apiClient.get('/api/sys-severity/template', {
  responseType: 'blob'
});

// Download template
const url = window.URL.createObjectURL(new Blob([response]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'sys_severity_template.xlsx');
document.body.appendChild(link);
link.click();
link.remove();
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/api/sys-severity/template" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output sys_severity_template.xlsx
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Excel file với 1 header row + 1 sample data row

---
