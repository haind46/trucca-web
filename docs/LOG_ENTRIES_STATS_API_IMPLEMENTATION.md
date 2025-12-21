# API Thống Kê Log Entries - Tài Liệu Implementation

## Tổng Quan

API này cung cấp thống kê tổng hợp về log entries trong một khoảng thời gian, bao gồm tổng số log và phân bổ theo từng severity level. API được tối ưu để trả về tất cả thống kê trong **một lần gọi duy nhất** thay vì phải gọi nhiều lần.

## Endpoint

```
GET /api/log-entries/statistics
```

## Lợi Ích

### So Sánh với Cách Cũ

**Cách cũ (6 API calls):**
```
GET /api/log-entries?page=1&limit=1&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=DOWN&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=CRITICAL&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=MAJOR&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=MINOR&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
GET /api/log-entries?page=1&limit=1&severity=WARNING&occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28
```
- **Tổng thời gian**: 300-1200ms (6 requests)
- **Băng thông**: 6x requests

**Cách mới (1 API call):**
```
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59
```
- **Tổng thời gian**: 50-200ms (1 request)
- **Băng thông**: 1x request
- **Cải thiện**: ~80% giảm số requests và thời gian

## Request Parameters

### Query Parameters

| Tên | Type | Bắt buộc | Mô tả | Ví dụ |
|-----|------|----------|-------|-------|
| `occurredAtFrom` | String | **Có** | Thời gian bắt đầu (ISO format) | `2025-11-28T00:00:00` |
| `occurredAtTo` | String | **Có** | Thời gian kết thúc (ISO format) | `2025-11-28T23:59:59` |
| `systemName` | String | Không | Filter theo tên hệ thống | `HN-CORE-01` |
| `hostName` | String | Không | Filter theo tên host (LIKE search) | `server-01` |
| `hostIp` | String | Không | Filter theo IP của host | `192.168.1.100` |

### Lưu Ý về Date Format

- **Format**: ISO 8601 LocalDateTime (`yyyy-MM-ddTHH:mm:ss`)
- **Ví dụ hợp lệ**:
  - `2025-11-28T00:00:00` (đầu ngày)
  - `2025-11-28T23:59:59` (cuối ngày)
  - `2025-11-28T14:30:00` (giữa ngày)
- **Không hợp lệ**:
  - `2025-11-28` (thiếu time)
  - `2025-11-28 00:00:00` (sai separator, phải dùng `T`)

### Headers

```
Content-Type: application/json
```

## Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Statistics retrieved successfully",
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
      "from": "2025-11-28T00:00:00",
      "to": "2025-11-28T23:59:59"
    }
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error retrieving statistics: Text '2025-11-28' could not be parsed",
  "data": null
}
```

## Response Fields

### LogEntryStatisticsResponse Object

| Field | Type | Mô tả |
|-------|------|-------|
| `total` | Long | Tổng số log entries trong khoảng thời gian (bao gồm tất cả severity) |
| `severityCounts` | List<SeverityCountDTO> | Danh sách count theo từng severity, sắp xếp theo priority giảm dần |
| `dateRange` | DateRangeDTO | Khoảng thời gian được query |

### SeverityCountDTO Object

| Field | Type | Mô tả |
|-------|------|-------|
| `severityCode` | String | Mã severity (DOWN, CRITICAL, MAJOR, MINOR, WARNING) |
| `severityName` | String | Tên hiển thị của severity |
| `count` | Long | Số lượng log entries có severity này |
| `colorCode` | String | Mã màu hex để hiển thị UI (từ bảng sys_severity) |
| `priorityLevel` | Integer | Mức độ ưu tiên (100=cao nhất, dùng để sort) |

### DateRangeDTO Object

| Field | Type | Mô tả |
|-------|------|-------|
| `from` | LocalDateTime | Thời gian bắt đầu |
| `to` | LocalDateTime | Thời gian kết thúc |

## Use Cases

### 1. Hiển Thị Dashboard Cards

Frontend có 6 cards:
- 1 card "Tổng Log"
- 5 cards cho từng severity level

```javascript
const { data: statsData } = await fetch(
  '/api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59'
);

const stats = statsData.data;

// Card 1: Tổng Log
const totalCard = {
  title: 'Tổng Log',
  count: stats.total,
  icon: 'list'
};

// Cards 2-6: Severity Cards
const severityCards = stats.severityCounts.map(severity => ({
  title: severity.severityName,
  count: severity.count,
  color: severity.colorCode,
  severity: severity.severityCode
}));
```

### 2. Filter Theo Hệ Thống

Lọc thống kê cho một hệ thống cụ thể:

```bash
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59&systemName=HN-CORE-01
```

### 3. Filter Theo Host

Lọc thống kê cho các host có tên chứa "server":

```bash
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59&hostName=server
```

### 4. Thống Kê Theo Tuần/Tháng

```javascript
// Thống kê tuần này
const today = new Date();
const weekStart = new Date(today.setDate(today.getDate() - 7));
const weekEnd = new Date();

const response = await fetch(
  `/api/log-entries/statistics?` +
  `occurredAtFrom=${weekStart.toISOString().slice(0,19)}&` +
  `occurredAtTo=${weekEnd.toISOString().slice(0,19)}`
);
```

## Ví Dụ Cụ Thể

### Scenario 1: Thống Kê Hôm Nay

**Request:**
```bash
curl -X GET "http://localhost:8080/api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Statistics retrieved successfully",
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
      "from": "2025-11-28T00:00:00",
      "to": "2025-11-28T23:59:59"
    }
  }
}
```

**Verification:**
```
total = 5 + 25 + 150 + 354 + 700 = 1234 ✓
```

### Scenario 2: Thống Kê Cho Hệ Thống Cụ Thể

**Request:**
```bash
curl -X GET "http://localhost:8080/api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59&systemName=HN-CORE-DATABASE" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 456,
    "severityCounts": [
      {
        "severityCode": "CRITICAL",
        "severityName": "Critical",
        "count": 12,
        "colorCode": "#EA580C",
        "priorityLevel": 90
      },
      {
        "severityCode": "MAJOR",
        "severityName": "Major",
        "count": 78,
        "colorCode": "#F59E0B",
        "priorityLevel": 70
      },
      {
        "severityCode": "MINOR",
        "severityName": "Minor",
        "count": 234,
        "colorCode": "#3B82F6",
        "priorityLevel": 50
      },
      {
        "severityCode": "WARNING",
        "severityName": "Warning",
        "count": 132,
        "colorCode": "#84CC16",
        "priorityLevel": 30
      }
    ],
    "dateRange": {
      "from": "2025-11-28T00:00:00",
      "to": "2025-11-28T23:59:59"
    }
  }
}
```

**Lưu ý:** Hệ thống này không có log DOWN trong khoảng thời gian này.

### Scenario 3: Không Có Log Nào

**Request:**
```bash
curl -X GET "http://localhost:8080/api/log-entries/statistics?occurredAtFrom=2025-12-01T00:00:00&occurredAtTo=2025-12-01T23:59:59"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 0,
    "severityCounts": [],
    "dateRange": {
      "from": "2025-12-01T00:00:00",
      "to": "2025-12-01T23:59:59"
    }
  }
}
```

### Scenario 4: Invalid Date Format

**Request:**
```bash
curl -X GET "http://localhost:8080/api/log-entries/statistics?occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28"
```

**Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error retrieving statistics: Text '2025-11-28' could not be parsed at index 10",
  "data": null
}
```

## Technical Details

### Database Queries

API thực hiện 2 queries:

#### Query 1: Lấy Tổng Count
```sql
SELECT COUNT(*)
FROM log_entries
WHERE occurred_at BETWEEN :startDate AND :endDate
  AND (:systemName IS NULL OR system_name = :systemName)
  AND (:hostName IS NULL OR host_name LIKE CONCAT('%', :hostName, '%'))
  AND (:hostIp IS NULL OR host_ip = :hostIp);
```

#### Query 2: Count theo Severity (GROUP BY)
```sql
SELECT
  le.severity as severity,
  COUNT(*) as count,
  COALESCE(ss.severity_code, le.severity) as severityCode,
  COALESCE(ss.severity_name, le.severity) as severityName,
  COALESCE(ss.color_code, '#999999') as colorCode,
  COALESCE(ss.priority_level, 0) as priorityLevel
FROM log_entries le
LEFT JOIN sys_severity ss ON le.severity = ss.severity_code AND ss.is_active = true
WHERE le.occurred_at BETWEEN :startDate AND :endDate
  AND (:systemName IS NULL OR le.system_name = :systemName)
  AND (:hostName IS NULL OR le.host_name LIKE CONCAT('%', :hostName, '%'))
  AND (:hostIp IS NULL OR le.host_ip = :hostIp)
GROUP BY le.severity, ss.severity_code, ss.severity_name, ss.color_code, ss.priority_level
ORDER BY COALESCE(ss.priority_level, 0) DESC;
```

### Performance

- **Indexes sử dụng**:
  - `occurred_at` (primary filter)
  - `system_name`, `host_name`, `host_ip` (optional filters)
- **Expected query time**: 50-200ms với 100k records
- **Optimizations**:
  - LEFT JOIN với sys_severity để lấy metadata
  - COALESCE để xử lý severity không tồn tại trong sys_severity
  - ORDER BY priority_level DESC để sort kết quả

### Caching (Optional)

API có thể cache kết quả vì data ít thay đổi:

```java
@Cacheable(value = "logStatistics", key = "#startDate + '-' + #endDate + '-' + #systemName")
public LogEntryStatisticsResponse getStatistics(...) {
    // ...
}
```

Với TTL = 30 seconds, phù hợp với auto-refresh interval của frontend.

## Frontend Integration

### React Query Example

```typescript
import { useQuery } from '@tanstack/react-query';

interface StatisticsParams {
  occurredAtFrom: string;
  occurredAtTo: string;
  systemName?: string;
  hostName?: string;
  hostIp?: string;
}

const fetchStatistics = async (params: StatisticsParams) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();

  const response = await fetch(
    `/api/log-entries/statistics?${queryString}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return response.json();
};

export const useLogStatistics = (params: StatisticsParams) => {
  return useQuery({
    queryKey: ['log-statistics', params],
    queryFn: () => fetchStatistics(params),
    refetchInterval: 30000, // Auto-refresh every 30s
    staleTime: 30000,
  });
};

// Usage in component
const Dashboard = () => {
  const { data, isLoading, error } = useLogStatistics({
    occurredAtFrom: '2025-11-28T00:00:00',
    occurredAtTo: '2025-11-28T23:59:59',
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  const stats = data.data;

  return (
    <>
      <TotalCard count={stats.total} />
      {stats.severityCounts.map(severity => (
        <SeverityCard key={severity.severityCode} {...severity} />
      ))}
    </>
  );
};
```

## Testing

### Test Cases

#### 1. Happy Path - Có Data
```bash
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59

Expected:
- 200 OK
- total > 0
- severityCounts có ít nhất 1 severity
- sum(severityCounts.count) = total
```

#### 2. Không Có Data
```bash
GET /api/log-entries/statistics?occurredAtFrom=2099-01-01T00:00:00&occurredAtTo=2099-01-01T23:59:59

Expected:
- 200 OK
- total = 0
- severityCounts = []
```

#### 3. Filter Theo System
```bash
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59&systemName=HN-CORE-01

Expected:
- 200 OK
- Chỉ count logs từ system HN-CORE-01
```

#### 4. Invalid Date Format
```bash
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28&occurredAtTo=2025-11-28

Expected:
- 400 Bad Request
- success = false
- message chứa "could not be parsed"
```

#### 5. Performance Test
```bash
# Test với large dataset
GET /api/log-entries/statistics?occurredAtFrom=2025-01-01T00:00:00&occurredAtTo=2025-12-31T23:59:59

Expected:
- Response time < 500ms (với 100k records)
- Response time < 1000ms (với 1M records)
```

#### 6. Verify Severity Order
```bash
GET /api/log-entries/statistics?occurredAtFrom=2025-11-28T00:00:00&occurredAtTo=2025-11-28T23:59:59

Expected:
- severityCounts[0].priorityLevel >= severityCounts[1].priorityLevel
- severityCounts sorted by priorityLevel DESC
```

## Troubleshooting

### Issue 1: "could not be parsed" Error

**Nguyên nhân:** Date format không đúng

**Giải pháp:**
- Đảm bảo format: `yyyy-MM-ddTHH:mm:ss`
- Sử dụng separator `T` giữa date và time
- Ví dụ đúng: `2025-11-28T00:00:00`

### Issue 2: Total không bằng Sum của Severity Counts

**Nguyên nhân:** Có log entries với severity NULL hoặc không có trong sys_severity

**Giải pháp:**
- Query sử dụng LEFT JOIN nên vẫn count các severity không có trong sys_severity
- Các severity không có metadata sẽ có:
  - severityCode = severity value từ log_entries
  - colorCode = `#999999` (default)
  - priorityLevel = 0

### Issue 3: Performance Chậm

**Kiểm tra:**
1. Index trên `occurred_at` có hoạt động?
2. Date range có quá lớn không? (> 1 năm)
3. Số lượng records trong khoảng thời gian?

**Giải pháp:**
- Thu hẹp date range
- Thêm filters (systemName, hostName)
- Implement caching
- Optimize database indexes

### Issue 4: Severity Counts Không Đầy Đủ

**Nguyên nhân:** Một số severity không có log entries trong khoảng thời gian

**Lưu ý:**
- API chỉ trả về các severity có ít nhất 1 log entry
- Frontend cần xử lý missing severities bằng cách hiển thị count = 0

## Changelog

### Version 1.0.0 (2025-11-28)
- Initial release
- Implement statistics endpoint
- Support filters: systemName, hostName, hostIp
- Optimize with GROUP BY query
- Return severity metadata (color, priority)

## Liên Hệ & Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.
