# API TRA CỨU LOG HỆ THỐNG (LOG ENTRIES)

Base URL: `http://localhost:8002`

## Mô tả chung

Đây là **giao diện trái tim của hệ thống**, nơi tập trung toàn bộ log phát sinh từ các hệ thống giám sát. API này chỉ hỗ trợ **TRA CỨU và EXPORT**, không hỗ trợ thêm mới, sửa đổi hay xóa log.

## Cấu trúc Log Entry

```json
{
  "id": 12345,
  "severity": "HIGH",
  "occurredAt": "2025-01-15T10:30:00",
  "alarmDate": "2025-01-15T10:30:00",
  "ancestry": "/root/parent/child",
  "systemName": "Production System",
  "hostName": "server-01",
  "hostIp": "192.168.1.100",
  "resourceName": "Database Connection",
  "target": "PostgreSQL DB",
  "resourceType": "DATABASE",
  "alarmName": "DB_CONNECTION_ALARM",
  "conditionLog": "Connection timeout after 30s",
  "eventType": "ERROR",
  "eventSource": "Application",
  "eventDetail": "Failed to connect to database: Connection refused",
  "errorType": "CONNECTION_ERROR",
  "translatedDetail": "Không thể kết nối đến cơ sở dữ liệu: Kết nối bị từ chối",
  "analyzedBy": "AI_SYSTEM",
  "solutionSuggest": "Kiểm tra kết nối mạng và trạng thái database server",
  "resourceAncestry": "/datacenter/rack-1/server-01",
  "createdAt": "2025-01-15T10:30:05",
  "updatedAt": "2025-01-15T10:30:05"
}
```

---

## 1. Lấy Danh Sách Tất Cả Log Entries

### Endpoint
```
GET /api/log-entries
```

### Mô tả
Lấy danh sách tất cả log entries với phân trang, hỗ trợ tìm kiếm theo từ khóa và sắp xếp.

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số bản ghi trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong nhiều trường) |
| sort_dir | String | Không | desc | Hướng sắp xếp: `asc` hoặc `desc` |
| sort_key | String | Không | occurred_at | Trường dùng để sắp xếp |

### Ví dụ Request

```bash
# Lấy trang 1, mỗi trang 20 bản ghi, sắp xếp theo occurred_at giảm dần
GET http://localhost:8002/api/log-entries?page=1&limit=20&sort_dir=desc&sort_key=occurred_at

# Tìm kiếm với từ khóa "connection"
GET http://localhost:8002/api/log-entries?page=1&limit=10&keyword=connection

# Sắp xếp theo severity tăng dần
GET http://localhost:8002/api/log-entries?page=1&limit=10&sort_key=severity&sort_dir=asc
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": 12345,
        "severity": "HIGH",
        "occurredAt": "2025-01-15T10:30:00",
        "alarmDate": "2025-01-15T10:30:00",
        "systemName": "Production System",
        "hostName": "server-01",
        "hostIp": "192.168.1.100",
        "resourceName": "Database Connection",
        "resourceType": "DATABASE",
        "alarmName": "DB_CONNECTION_ALARM",
        "eventType": "ERROR",
        "eventSource": "Application",
        "eventDetail": "Failed to connect to database",
        "errorType": "CONNECTION_ERROR",
        "translatedDetail": "Không thể kết nối đến cơ sở dữ liệu",
        "analyzedBy": "AI_SYSTEM",
        "solutionSuggest": "Kiểm tra kết nối mạng",
        "createdAt": "2025-01-15T10:30:05"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 500,
      "itemsPerPage": 10
    }
  }
}
```

---

## 2. Tìm Kiếm Log với Bộ Lọc Nâng Cao

### Endpoint
```
GET /api/log-entries/filter
```

### Mô tả
Tìm kiếm log entries với nhiều tiêu chí lọc nâng cao. Đây là API chính cho màn hình tra cứu log, hỗ trợ lọc theo severity, khoảng thời gian, thông tin hệ thống, host, resource, alarm, event, error type, v.v.

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| page | Integer | Không (mặc định: 1) | Số trang | 1 |
| limit | Integer | Không (mặc định: 10) | Số bản ghi/trang | 20 |
| keyword | String | Không | Từ khóa tìm kiếm tổng quát | "connection error" |
| severity | String | Không | Mức độ nghiêm trọng | "HIGH", "CRITICAL", "MEDIUM", "LOW", "INFO" |
| occurredAtFrom | String | Không | Thời gian bắt đầu (yyyy-MM-dd) | "2025-01-01" |
| occurredAtTo | String | Không | Thời gian kết thúc (yyyy-MM-dd) | "2025-01-31" |
| systemName | String | Không | Tên hệ thống | "Production System" |
| hostName | String | Không | Tên host/server | "server-01" |
| hostIp | String | Không | Địa chỉ IP của host | "192.168.1.100" |
| resourceName | String | Không | Tên tài nguyên | "Database Connection" |
| resourceType | String | Không | Loại tài nguyên | "DATABASE", "SERVER", "NETWORK" |
| alarmName | String | Không | Tên cảnh báo | "DB_CONNECTION_ALARM" |
| eventType | String | Không | Loại sự kiện | "ERROR", "WARNING", "INFO" |
| eventSource | String | Không | Nguồn sự kiện | "Application", "System" |
| errorType | String | Không | Loại lỗi | "CONNECTION_ERROR", "TIMEOUT" |
| analyzedBy | String | Không | Phân tích bởi | "AI_SYSTEM", "ADMIN_USER" |
| sort_dir | String | Không (mặc định: desc) | Hướng sắp xếp | "asc", "desc" |
| sort_key | String | Không (mặc định: occurred_at) | Trường sắp xếp | "occurred_at", "severity" |

### Ví dụ Request

```bash
# 1. Lọc theo severity và khoảng thời gian
GET http://localhost:8002/api/log-entries/filter?severity=HIGH&occurredAtFrom=2025-01-01&occurredAtTo=2025-01-31&page=1&limit=20

# 2. Lọc theo system và host
GET http://localhost:8002/api/log-entries/filter?systemName=Production System&hostName=server-01&page=1&limit=10

# 3. Lọc theo resource type và event type
GET http://localhost:8002/api/log-entries/filter?resourceType=DATABASE&eventType=ERROR&page=1&limit=15

# 4. Tìm kiếm kết hợp nhiều tiêu chí
GET http://localhost:8002/api/log-entries/filter?severity=CRITICAL&systemName=Production System&errorType=CONNECTION_ERROR&occurredAtFrom=2025-01-10&occurredAtTo=2025-01-15&keyword=timeout&page=1&limit=25

# 5. Lọc theo IP và alarm name
GET http://localhost:8002/api/log-entries/filter?hostIp=192.168.1.100&alarmName=DB_CONNECTION_ALARM&sort_dir=asc&sort_key=occurred_at
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": 12345,
        "severity": "HIGH",
        "occurredAt": "2025-01-15T10:30:00",
        "alarmDate": "2025-01-15T10:30:00",
        "ancestry": "/root/prod",
        "systemName": "Production System",
        "hostName": "server-01",
        "hostIp": "192.168.1.100",
        "resourceName": "Database Connection",
        "target": "PostgreSQL DB",
        "resourceType": "DATABASE",
        "alarmName": "DB_CONNECTION_ALARM",
        "conditionLog": "Connection timeout after 30s",
        "eventType": "ERROR",
        "eventSource": "Application",
        "eventDetail": "Failed to connect to database: Connection refused",
        "errorType": "CONNECTION_ERROR",
        "translatedDetail": "Không thể kết nối đến cơ sở dữ liệu: Kết nối bị từ chối",
        "analyzedBy": "AI_SYSTEM",
        "solutionSuggest": "Kiểm tra kết nối mạng và trạng thái database server",
        "resourceAncestry": "/datacenter/rack-1/server-01",
        "createdAt": "2025-01-15T10:30:05",
        "updatedAt": "2025-01-15T10:30:05"
      },
      {
        "id": 12346,
        "severity": "HIGH",
        "occurredAt": "2025-01-15T11:45:00",
        "alarmDate": "2025-01-15T11:45:00",
        "systemName": "Production System",
        "hostName": "server-02",
        "hostIp": "192.168.1.101",
        "resourceName": "API Gateway",
        "resourceType": "SERVER",
        "alarmName": "HIGH_LATENCY_ALARM",
        "eventType": "WARNING",
        "eventSource": "Monitoring",
        "eventDetail": "API response time exceeded threshold",
        "errorType": "PERFORMANCE_ISSUE",
        "translatedDetail": "Thời gian phản hồi API vượt ngưỡng cho phép",
        "analyzedBy": "AI_SYSTEM",
        "solutionSuggest": "Kiểm tra tải server và tối ưu query database",
        "createdAt": "2025-01-15T11:45:05"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 148,
      "itemsPerPage": 10
    }
  }
}
```

### Response Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid filter parameters",
  "statusCode": 400,
  "data": null
}
```

---

## 3. Export Log Entries sang Excel

### Endpoint
```
GET /api/log-entries/export
```

### Mô tả
Export danh sách log entries trong khoảng thời gian nhất định ra file Excel (.xlsx). File Excel có định dạng đẹp với:
- Màu sắc phân biệt theo severity (CRITICAL=Đỏ, HIGH=Cam, MEDIUM=Vàng, LOW=Xanh lá, INFO=Xám)
- Thống kê tổng hợp theo severity
- Tự động điều chỉnh độ rộng cột
- Header với định dạng đậm

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| startDate | String | **Có** | Ngày bắt đầu (yyyy-MM-dd) | "2025-01-01" |
| endDate | String | **Có** | Ngày kết thúc (yyyy-MM-dd) | "2025-01-31" |
| severity | String | Không | Lọc theo mức độ nghiêm trọng | "HIGH", "CRITICAL" |
| systemName | String | Không | Lọc theo tên hệ thống | "Production System" |

### Ví dụ Request

```bash
# 1. Export tất cả log trong tháng 1/2025
GET http://localhost:8002/api/log-entries/export?startDate=2025-01-01&endDate=2025-01-31

# 2. Export chỉ log có severity HIGH trong khoảng thời gian
GET http://localhost:8002/api/log-entries/export?startDate=2025-01-01&endDate=2025-01-15&severity=HIGH

# 3. Export log của hệ thống Production trong tuần
GET http://localhost:8002/api/log-entries/export?startDate=2025-01-10&endDate=2025-01-16&systemName=Production System

# 4. Export log CRITICAL của Production System
GET http://localhost:8002/api/log-entries/export?startDate=2025-01-01&endDate=2025-01-31&severity=CRITICAL&systemName=Production System
```

### Response Success (200 OK)

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Headers:**
```
Content-Disposition: attachment; filename=log_entries_export_2025-01-01_to_2025-01-31.xlsx
```

**Body:** Binary Excel file (.xlsx)

### Cấu trúc File Excel

File Excel bao gồm các cột sau:

1. **ID** - Mã log entry
2. **Severity** - Mức độ nghiêm trọng (có màu sắc)
3. **Occurred At** - Thời gian xảy ra
4. **Alarm Date** - Thời gian cảnh báo
5. **System Name** - Tên hệ thống
6. **Host Name** - Tên host
7. **Host IP** - Địa chỉ IP
8. **Resource Name** - Tên tài nguyên
9. **Resource Type** - Loại tài nguyên
10. **Alarm Name** - Tên cảnh báo
11. **Event Type** - Loại sự kiện
12. **Event Source** - Nguồn sự kiện
13. **Event Detail** - Chi tiết sự kiện
14. **Error Type** - Loại lỗi
15. **Translated Detail** - Chi tiết đã dịch
16. **Analyzed By** - Phân tích bởi
17. **Solution Suggest** - Giải pháp đề xuất

**Đặc điểm:**
- Sheet đầu tiên: Thống kê tổng hợp theo severity
- Sheet thứ hai: Danh sách chi tiết log entries
- Màu sắc severity:
  - CRITICAL: Đỏ (RGB 255, 0, 0)
  - HIGH: Cam (RGB 255, 165, 0)
  - MEDIUM: Vàng (RGB 255, 255, 0)
  - LOW: Xanh lá (RGB 0, 255, 0)
  - INFO: Xám (RGB 192, 192, 192)

---

## 4. Nhận Log Entry từ Hệ Thống Giám Sát

### Endpoint
```
POST /api/log-entries
```

### Mô tả
API này dành cho các hệ thống giám sát gửi log về backend. **Frontend thường KHÔNG cần sử dụng API này**, chỉ các monitoring system mới sử dụng.

### Request Body

```json
{
  "severity": "HIGH",
  "occurredAt": "2025-01-15T10:30:00",
  "alarmDate": "2025-01-15T10:30:00",
  "ancestry": "/root/parent/child",
  "systemName": "Production System",
  "hostName": "server-01",
  "hostIp": "192.168.1.100",
  "resourceName": "Database Connection",
  "target": "PostgreSQL DB",
  "resourceType": "DATABASE",
  "alarmName": "DB_CONNECTION_ALARM",
  "conditionLog": "Connection timeout after 30s",
  "eventType": "ERROR",
  "eventSource": "Application",
  "eventDetail": "Failed to connect to database: Connection refused",
  "errorType": "CONNECTION_ERROR",
  "translatedDetail": "Không thể kết nối đến cơ sở dữ liệu",
  "analyzedBy": "AI_SYSTEM",
  "solutionSuggest": "Kiểm tra kết nối mạng"
}
```

### Response Success (200 OK)

```json
{
  "id": 12345,
  "severity": "HIGH",
  "occurredAt": "2025-01-15T10:30:00",
  "alarmDate": "2025-01-15T10:30:00",
  "systemName": "Production System",
  "hostName": "server-01",
  "hostIp": "192.168.1.100",
  "resourceName": "Database Connection",
  "resourceType": "DATABASE",
  "alarmName": "DB_CONNECTION_ALARM",
  "eventType": "ERROR",
  "eventSource": "Application",
  "eventDetail": "Failed to connect to database",
  "errorType": "CONNECTION_ERROR",
  "translatedDetail": "Không thể kết nối đến cơ sở dữ liệu",
  "analyzedBy": "AI_SYSTEM",
  "solutionSuggest": "Kiểm tra kết nối mạng",
  "createdAt": "2025-01-15T10:30:05",
  "updatedAt": "2025-01-15T10:30:05"
}
```

---

## Lưu Ý Cho Frontend

### 1. Phân Trang
- `page` bắt đầu từ **1** (không phải 0)
- Sử dụng `pagination.totalPages` và `pagination.totalItems` để hiển thị phân trang
- `limit` có thể điều chỉnh để tăng/giảm số bản ghi hiển thị

### 2. Tìm Kiếm
- Tham số `keyword` tìm kiếm trên nhiều trường (event_detail, translated_detail, error_type, system_name, host_name, resource_name, alarm_name)
- Kết hợp `keyword` với các bộ lọc khác để tìm kiếm chính xác hơn

### 3. Sắp Xếp
- `sort_key` có thể là: `occurred_at`, `severity`, `created_at`, `system_name`, `host_name`, v.v.
- `sort_dir`: `asc` (tăng dần) hoặc `desc` (giảm dần)
- Mặc định sắp xếp theo `occurred_at desc` (log mới nhất trước)

### 4. Bộ Lọc Nâng Cao
- Tất cả các tham số filter đều **optional**
- Có thể kết hợp nhiều filter cùng lúc
- Filter theo thời gian: sử dụng `occurredAtFrom` và `occurredAtTo` với định dạng `yyyy-MM-dd`
- Severity levels: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`

### 5. Export Excel
- **Bắt buộc** phải có `startDate` và `endDate`
- Có thể thêm `severity` và `systemName` để lọc trước khi export
- Browser sẽ tự động download file với tên có định dạng: `log_entries_export_{startDate}_to_{endDate}.xlsx`
- File Excel có định dạng đẹp với màu sắc severity và thống kê tổng hợp

### 6. Hiển Thị Severity
Đề xuất hiển thị severity với màu sắc trên UI:
- **CRITICAL**: Badge màu đỏ
- **HIGH**: Badge màu cam
- **MEDIUM**: Badge màu vàng
- **LOW**: Badge màu xanh lá
- **INFO**: Badge màu xám

### 7. Giao Diện Đề Xuất
Vì đây là "**giao diện trái tim của hệ thống**", đề xuất:
- **Bảng log chính**: Hiển thị các log với màu sắc severity nổi bật
- **Bộ lọc bên trái/trên**: Form tìm kiếm nâng cao với tất cả các tiêu chí
- **Timeline view**: Hiển thị log theo trục thời gian
- **Statistics dashboard**: Biểu đồ thống kê theo severity, system, time range
- **Quick filters**: Các filter nhanh như "Last 24 hours", "Last 7 days", "Critical only"
- **Real-time updates**: Tự động refresh để hiển thị log mới (sử dụng polling hoặc WebSocket)
- **Detail panel**: Click vào log để xem chi tiết đầy đủ
- **Export button**: Nút export nổi bật để xuất báo cáo

### 8. Performance Tips
- Nên giới hạn `limit` ở mức hợp lý (10-50) để tránh tải quá nhiều dữ liệu
- Sử dụng filter để giảm thiểu số lượng bản ghi trả về
- Cache các filter thường dùng ở client side
- Sử dụng debounce cho keyword search

---

## Code Examples (JavaScript/TypeScript)

### Ví dụ 1: Lấy danh sách log với pagination

```javascript
async function getLogEntries(page = 1, limit = 10, keyword = '') {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_dir: 'desc',
    sort_key: 'occurred_at'
  });

  if (keyword) {
    params.append('keyword', keyword);
  }

  const response = await fetch(
    `http://localhost:8002/api/log-entries?${params.toString()}`
  );

  const result = await response.json();
  return result.data;
}
```

### Ví dụ 2: Tìm kiếm với bộ lọc nâng cao

```javascript
async function filterLogEntries(filters) {
  const params = new URLSearchParams();

  // Required params
  params.append('page', filters.page || '1');
  params.append('limit', filters.limit || '10');

  // Optional filters
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.severity) params.append('severity', filters.severity);
  if (filters.occurredAtFrom) params.append('occurredAtFrom', filters.occurredAtFrom);
  if (filters.occurredAtTo) params.append('occurredAtTo', filters.occurredAtTo);
  if (filters.systemName) params.append('systemName', filters.systemName);
  if (filters.hostName) params.append('hostName', filters.hostName);
  if (filters.hostIp) params.append('hostIp', filters.hostIp);
  if (filters.resourceType) params.append('resourceType', filters.resourceType);
  if (filters.eventType) params.append('eventType', filters.eventType);
  if (filters.errorType) params.append('errorType', filters.errorType);

  // Sort
  params.append('sort_dir', filters.sortDir || 'desc');
  params.append('sort_key', filters.sortKey || 'occurred_at');

  const response = await fetch(
    `http://localhost:8002/api/log-entries/filter?${params.toString()}`
  );

  const result = await response.json();
  return result.data;
}

// Sử dụng:
const logs = await filterLogEntries({
  page: 1,
  limit: 20,
  severity: 'HIGH',
  occurredAtFrom: '2025-01-01',
  occurredAtTo: '2025-01-31',
  systemName: 'Production System'
});
```

### Ví dụ 3: Export Excel

```javascript
async function exportLogEntries(startDate, endDate, severity = null, systemName = null) {
  const params = new URLSearchParams({
    startDate,
    endDate
  });

  if (severity) params.append('severity', severity);
  if (systemName) params.append('systemName', systemName);

  const response = await fetch(
    `http://localhost:8002/api/log-entries/export?${params.toString()}`
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `log_entries_export_${startDate}_to_${endDate}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Sử dụng:
await exportLogEntries('2025-01-01', '2025-01-31', 'CRITICAL', 'Production System');
```

### Ví dụ 4: React Component với Filters

```typescript
import React, { useState, useEffect } from 'react';

interface LogEntry {
  id: number;
  severity: string;
  occurredAt: string;
  systemName: string;
  eventDetail: string;
  // ... other fields
}

interface LogFilters {
  page: number;
  limit: number;
  keyword?: string;
  severity?: string;
  occurredAtFrom?: string;
  occurredAtTo?: string;
  systemName?: string;
}

const LogEntriesTable: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const [filters, setFilters] = useState<LogFilters>({
    page: 1,
    limit: 20,
    severity: '',
    keyword: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await filterLogEntries(filters);
      setLogs(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      case 'INFO': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div>
      {/* Filter Form */}
      <div className="filters">
        <input
          type="text"
          placeholder="Keyword search..."
          value={filters.keyword || ''}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
        />
        <select
          value={filters.severity || ''}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFO">Info</option>
        </select>
      </div>

      {/* Logs Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Severity</th>
            <th>Occurred At</th>
            <th>System</th>
            <th>Event Detail</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>
                <span style={{ color: getSeverityColor(log.severity) }}>
                  {log.severity}
                </span>
              </td>
              <td>{new Date(log.occurredAt).toLocaleString()}</td>
              <td>{log.systemName}</td>
              <td>{log.eventDetail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.currentPage === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## Tổng Kết

API Log Entries cung cấp đầy đủ các tính năng để:
1. ✅ Tra cứu log với phân trang và sắp xếp
2. ✅ Tìm kiếm nâng cao với nhiều tiêu chí lọc
3. ✅ Export dữ liệu ra Excel với định dạng đẹp
4. ✅ Nhận log từ hệ thống giám sát (cho monitoring systems)

**Frontend nên tập trung vào 3 API chính:**
- `GET /api/log-entries` - Danh sách log cơ bản
- `GET /api/log-entries/filter` - Tìm kiếm nâng cao
- `GET /api/log-entries/export` - Xuất báo cáo Excel

Với các API này, frontend có thể xây dựng một giao diện tra cứu log mạnh mẽ, thân thiện và đẹp mắt - xứng đáng là "**trái tim của hệ thống**"!
