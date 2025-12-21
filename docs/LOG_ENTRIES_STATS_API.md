# API Thống kê Log Entries - Yêu cầu Backend

## Tổng quan
Tài liệu này mô tả các API cần thiết để hiển thị thống kê log entries theo severity level trên giao diện Log Management.

## Mục đích
Hiển thị 6 card thống kê:
1. **Tổng Log**: Tổng số log trong khoảng thời gian
2. **5 Severity Cards**: Số lượng log cho mỗi mức severity (theo priority cao nhất)

## API Endpoints Hiện tại

### 1. API Filter Log Entries (Đã có)
**Endpoint**: `GET /api/log-entries`

**Query Parameters**:
```
{
  "page": 1,
  "limit": 20,
  "keyword": "",
  "severity": "",           // Mã severity: "DOWN", "CRITICAL", "MAJOR", "MINOR", "WARNING"
  "occurredAtFrom": "2025-11-28",
  "occurredAtTo": "2025-11-28",
  "systemName": "",
  "hostName": "",
  "hostIp": "",
  "resourceType": "",
  "eventType": "",
  "errorType": "",
  "sort_dir": "desc",
  "sort_key": "occurred_at"
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "data": [/* array of log entries */],
    "total": 1234,        // ← QUAN TRỌNG: Đây là số lượng dùng cho thống kê
    "page": 1,
    "size": 20
  }
}
```

## Cách Frontend Sử Dụng

### Cách 1: Sử dụng API hiện tại (Đang áp dụng)

Frontend gọi nhiều lần API filter với các tham số khác nhau để lấy count:

#### 1.1. Lấy Tổng số Log
```
GET /api/log-entries?page=1&limit=1&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
```
→ Chỉ cần `response.data.total` (không cần data array)

#### 1.2. Lấy Count cho mỗi Severity
```
GET /api/log-entries?page=1&limit=1&severity=DOWN&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=CRITICAL&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=MAJOR&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=MINOR&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=WARNING&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
```
→ Mỗi request trả về `response.data.total` = count của severity đó

**Ưu điểm**:
- Sử dụng API đã có
- Không cần code backend mới

**Nhược điểm**:
- Phải gọi 6 API calls (1 tổng + 5 severity)
- Tốn băng thông và thời gian

---

### Cách 2: Tạo API Thống kê riêng (ĐỀ XUẤT)

#### API mới: Get Log Statistics
**Endpoint**: `GET /api/log-entries/statistics`

**Query Parameters**:
```
{
  "occurredAtFrom": "2025-11-28",      // Bắt buộc
  "occurredAtTo": "2025-11-28",        // Bắt buộc
  "systemName": "",                     // Tùy chọn
  "hostName": "",                       // Tùy chọn
  "hostIp": ""                          // Tùy chọn
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "severityCounts": [
      {
        "severityCode": "DOWN",
        "severityName": "Down",
        "count": 5,
        "colorCode": "#DC2626",
        "priorityLevel": 100
      },
      {
        "severityCode": "CRITICAL",
        "severityName": "Critical",
        "count": 25,
        "colorCode": "#EA580C",
        "priorityLevel": 90
      },
      {
        "severityCode": "MAJOR",
        "severityName": "Major",
        "count": 150,
        "colorCode": "#F59E0B",
        "priorityLevel": 70
      },
      {
        "severityCode": "MINOR",
        "severityName": "Minor",
        "count": 354,
        "colorCode": "#3B82F6",
        "priorityLevel": 50
      },
      {
        "severityCode": "WARNING",
        "severityName": "Warning",
        "count": 700,
        "colorCode": "#84CC16",
        "priorityLevel": 30
      }
    ],
    "dateRange": {
      "from": "2025-11-28T00:00:00Z",
      "to": "2025-11-28T23:59:59Z"
    }
  }
}
```

**Ưu điểm**:
- Chỉ 1 API call thay vì 6 calls
- Nhanh hơn, hiệu quả hơn
- Dễ cache kết quả
- Giảm tải cho server

**Cách implement Backend (SQL)**:
```sql
-- Tổng count
SELECT COUNT(*) as total
FROM log_entries
WHERE occurred_at BETWEEN :fromDate AND :toDate
  AND (:systemName IS NULL OR system_name LIKE :systemName)
  AND (:hostName IS NULL OR host_name LIKE :hostName)
  AND (:hostIp IS NULL OR host_ip LIKE :hostIp)
  AND status = 1;  -- Chỉ lấy log active

-- Count theo severity (sử dụng GROUP BY)
SELECT
  le.severity,
  COUNT(*) as count,
  ss.severity_code,
  ss.severity_name,
  ss.color_code,
  ss.priority_level
FROM log_entries le
LEFT JOIN sys_severity ss ON le.severity = ss.severity_code
WHERE le.occurred_at BETWEEN :fromDate AND :toDate
  AND (:systemName IS NULL OR le.system_name LIKE :systemName)
  AND (:hostName IS NULL OR le.host_name LIKE :hostName)
  AND (:hostIp IS NULL OR le.host_ip LIKE :hostIp)
  AND le.status = 1
  AND ss.is_active = 1
GROUP BY le.severity, ss.severity_code, ss.severity_name, ss.color_code, ss.priority_level
ORDER BY ss.priority_level DESC;
```

---

## Yêu cầu Backend

### Option 1: Giữ nguyên (Không cần code gì thêm)
- API `/api/log-entries` hiện tại đã đủ
- Frontend sẽ gọi nhiều lần để lấy statistics

### Option 2: Tạo API mới (Khuyến nghị)
**Tạo endpoint mới**: `GET /api/log-entries/statistics`

**Nhiệm vụ**:
1. Nhận parameters: `occurredAtFrom`, `occurredAtTo`, `systemName` (optional), `hostName` (optional), `hostIp` (optional)
2. Query database để lấy:
   - Tổng số log trong khoảng thời gian
   - Count theo từng severity code (JOIN với bảng sys_severity)
3. Trả về response theo format trên
4. Hỗ trợ cache (vì data ít thay đổi trong 30s)

**Priority**: Medium (có thể dùng cách 1 tạm thời)

---

## Performance Notes

### Cách 1 (Hiện tại):
- 6 API calls
- Mỗi call ~ 50-200ms
- Tổng: 300-1200ms
- Refresh mỗi 30s

### Cách 2 (Đề xuất):
- 1 API call
- Response time: 50-200ms
- Giảm 80% số requests
- Có thể cache tại backend

---

## Frontend Implementation Reference

```typescript
// Current approach (6 calls)
const { data: totalData } = useQuery({
  queryKey: ["log-entries-total-count", fromDate, toDate],
  queryFn: () => logEntryService.filter({
    page: 1, limit: 1,
    occurredAtFrom: fromDate,
    occurredAtTo: toDate
  }),
});

const severityQueries = useQueries({
  queries: severities.map(sev => ({
    queryKey: ["severity-count", sev.code, fromDate, toDate],
    queryFn: () => logEntryService.filter({
      page: 1, limit: 1,
      severity: sev.code,
      occurredAtFrom: fromDate,
      occurredAtTo: toDate
    }),
  }))
});

// Proposed approach (1 call)
const { data: statsData } = useQuery({
  queryKey: ["log-entries-stats", fromDate, toDate],
  queryFn: () => logEntryService.getStatistics(fromDate, toDate),
});
```

---

## Testing

### Test Cases
1. Lấy thống kê cho hôm nay
2. Lấy thống kê cho 1 tuần
3. Lấy thống kê với filter systemName
4. Verify total = sum của tất cả severity counts
5. Verify chỉ lấy severity active
6. Verify performance < 200ms

### Sample Test Request
```bash
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
```

### Expected Response Time
- < 100ms: Excellent
- 100-200ms: Good
- 200-500ms: Acceptable
- > 500ms: Need optimization

---

## Liên hệ
Nếu có thắc mắc về API này, vui lòng liên hệ Frontend Team.

**Ngày tạo**: 2025-11-28
**Version**: 1.0
