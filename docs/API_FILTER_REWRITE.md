# API Filter Log Entries - VIẾT LẠI HOÀN TOÀN

## Tổng quan

API `/api/log-entries/filter` đã được viết lại hoàn toàn với mục đích:
- **Đơn giản hóa** query và code
- **Tập trung** vào filter chính: thời gian (occurredAtFrom, occurredAtTo)
- **Loại bỏ** các filter phức tạp không cần thiết
- **Sử dụng NULL** thay vì empty string để tránh lỗi type mismatch

---

## Những thay đổi chính

### 1. LogEntryRepository.java

**Thêm 2 methods mới:**

```java
// Query dữ liệu
List<LogEntry> filterByDateRange(
    LocalDateTime occurredAtFrom,    // NULL = không filter
    LocalDateTime occurredAtTo,      // NULL = không filter
    String severity,                 // NULL = không filter
    String systemName,               // NULL = không filter
    String keyword,                  // NULL = không filter
    String sortKey,
    String sortDir,
    int limit,
    int offset
);

// Count total cho pagination
long countFilterByDateRange(
    LocalDateTime occurredAtFrom,
    LocalDateTime occurredAtTo,
    String severity,
    String systemName,
    String keyword
);
```

**Đặc điểm query:**
- Sử dụng `IS NULL` thay vì `= ''` để check parameter
- Không có issue với bytea/VARCHAR type mismatch
- COALESCE chỉ dùng cho column, không dùng cho parameter
- Đơn giản và dễ đọc

### 2. LogEntryService.java

**Thêm method mới:**

```java
public ObjectNode filterLogEntriesByDateRange(
    int page,
    int limit,
    String occurredAtFrom,      // ISO format string hoặc NULL
    String occurredAtTo,        // ISO format string hoặc NULL
    String severity,
    String systemName,
    String keyword,
    String sortDir,
    String sortKey
)
```

**Xử lý:**
- Parse String → LocalDateTime (NULL nếu empty hoặc parse error)
- Gọi repository methods
- Trả về ObjectNode với pagination info

### 3. LogEntryController.java

**Update endpoint `/filter`:**
- Giảm số lượng parameters từ 15+ xuống còn 7
- Chỉ giữ lại các filter chính:
  - `occurredAtFrom`, `occurredAtTo` (thời gian)
  - `severity` (mức độ nghiêm trọng)
  - `systemName` (tên hệ thống)
  - `keyword` (tìm kiếm trong system_name, host_name, alarm_name, event_detail)
  - `sort_dir`, `sort_key` (sắp xếp)
  - `page`, `limit` (phân trang)

---

## API Usage

### Endpoint

```
GET /api/log-entries/filter
```

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | Integer | No | Số trang (1-based) | `1` |
| `limit` | Integer | No | Số bản ghi mỗi trang | `20` |
| `occurredAtFrom` | String | No | Thời gian bắt đầu (ISO format) | `2025-12-20T10:22:00` |
| `occurredAtTo` | String | No | Thời gian kết thúc (ISO format) | `2025-12-21T10:22:00` |
| `severity` | String | No | Mức độ (CRITICAL, HIGH, MEDIUM, LOW, INFO) | `CRITICAL` |
| `systemName` | String | No | Tên hệ thống (exact match) | `HN-CORE-01` |
| `keyword` | String | No | Tìm kiếm trong nhiều fields | `database` |
| `sort_dir` | String | No | Chiều sắp xếp (asc/desc) | `desc` |
| `sort_key` | String | No | Field để sắp xếp | `occurred_at` |

### Examples

#### 1. Lấy tất cả log entries (không filter)

```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20"
```

#### 2. Filter theo thời gian

```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&occurredAtFrom=2025-12-20T10:22:00&occurredAtTo=2025-12-21T10:22:00"
```

#### 3. Filter theo thời gian + severity

```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&occurredAtFrom=2025-12-20T10:22:00&occurredAtTo=2025-12-21T10:22:00&severity=CRITICAL"
```

#### 4. Filter theo system name

```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&systemName=HN-CORE-01"
```

#### 5. Tìm kiếm theo keyword

```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&keyword=database"
```

#### 6. Kết hợp tất cả filters

```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&occurredAtFrom=2025-12-20T00:00:00&occurredAtTo=2025-12-21T23:59:59&severity=HIGH&systemName=HN-CORE-01&keyword=cpu&sort_dir=desc&sort_key=occurred_at"
```

### Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": 1,
        "severity": "CRITICAL",
        "occurredAt": "2025-12-21T16:51:00",
        "systemName": "HN-CORE-01",
        "hostName": "db-server-01",
        "alarmName": "DB_CONNECTION_ALARM",
        "eventDetail": "Database connection pool exhausted",
        ...
      }
    ],
    "total": 20,
    "page": 1,
    "size": 20
  }
}
```

---

## Test với dữ liệu mẫu

### Kiểm tra dữ liệu hiện có

```sql
-- Xem 20 log mới nhất
SELECT id, severity, occurred_at, system_name, alarm_name
FROM log_entries
ORDER BY occurred_at DESC
LIMIT 20;

-- Kiểm tra time range
SELECT
    MIN(occurred_at) as oldest,
    MAX(occurred_at) as newest,
    COUNT(*) as total
FROM log_entries;

-- Phân bố theo severity
SELECT severity, COUNT(*) as count
FROM log_entries
GROUP BY severity
ORDER BY count DESC;
```

### Test scenarios

**Scenario 1: Không có filter nào**
- Kết quả mong đợi: Trả về tất cả log entries (max 20 do limit)

**Scenario 2: Chỉ filter theo thời gian**
- Input: `occurredAtFrom=2025-12-21T00:00:00&occurredAtTo=2025-12-21T23:59:59`
- Kết quả mong đợi: Chỉ log entries trong ngày 21/12/2025

**Scenario 3: Filter theo severity**
- Input: `severity=CRITICAL`
- Kết quả mong đợi: Chỉ log entries có severity = CRITICAL

**Scenario 4: Keyword search**
- Input: `keyword=database`
- Kết quả mong đợi: Log entries có "database" trong system_name, host_name, alarm_name, hoặc event_detail

---

## So sánh với API cũ

### API cũ (searchLogEntries)

**Vấn đề:**
- 19 parameters (quá nhiều)
- Sử dụng empty string `""` → gây lỗi bytea type mismatch
- COALESCE pattern phức tạp
- Query dài và khó maintain

**Code:**
```java
searchLogEntries(
    nvl(severity),           // "" nếu null
    nvl(occurredAtFrom),     // "" nếu null
    nvl(occurredAtTo),       // "" nếu null
    // ... 16 parameters nữa
)
```

**Query:**
```sql
WHERE (:severity = '' OR COALESCE(severity, '') = :severity)
-- Lỗi: '' = bytea ???
```

### API mới (filterByDateRange)

**Ưu điểm:**
- 9 parameters (đơn giản hơn)
- Sử dụng NULL → không có type mismatch
- Query rõ ràng và dễ đọc
- Dễ extend và maintain

**Code:**
```java
filterByDateRange(
    fromDateTime,    // NULL nếu không có
    toDateTime,      // NULL nếu không có
    severity,        // NULL nếu không có
    // ... chỉ 6 parameters nữa
)
```

**Query:**
```sql
WHERE (:occurredAtFrom IS NULL OR occurred_at >= CAST(:occurredAtFrom AS TIMESTAMP))
-- Rõ ràng: NULL = skip filter
```

---

## Rebuild và Test

### 1. Rebuild application

```bash
# Nếu có Maven trong PATH
mvn clean install

# Hoặc sử dụng IDE
# IntelliJ IDEA: Build > Rebuild Project
```

### 2. Restart application

```bash
mvn spring-boot:run
```

Hoặc restart trong IDE.

### 3. Test API

**Test 1: Get all (không filter)**
```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&sort_dir=desc&sort_key=occurred_at"
```

**Test 2: Filter theo thời gian (dùng data từ db/insert_sample_log_data.sql)**
```bash
# Data mẫu có occurred_at từ 2025-12-21 08:00 đến 12:45
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&occurredAtFrom=2025-12-21T08:00:00&occurredAtTo=2025-12-21T12:45:00"
```

**Test 3: Với URL ban đầu của bạn**
```bash
curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20&sort_dir=desc&sort_key=occurred_at&occurredAtFrom=2025-12-20T10:22:00&occurredAtTo=2025-12-21T10:22:00"
```

### 4. Verify response

Response phải có:
- `success: true`
- `data.total`: Số lượng bản ghi tìm thấy
- `data.data`: Array của log entries
- `data.page`: Trang hiện tại
- `data.size`: Số bản ghi mỗi trang

---

## Troubleshooting

### Issue: Vẫn không có dữ liệu

**Giải pháp:**
1. Kiểm tra dữ liệu trong database:
   ```sql
   SELECT COUNT(*) FROM log_entries;
   ```

2. Kiểm tra time range của dữ liệu:
   ```sql
   SELECT MIN(occurred_at), MAX(occurred_at) FROM log_entries;
   ```

3. Test không có filter:
   ```bash
   curl "http://localhost:8002/api/log-entries/filter?page=1&limit=20"
   ```

### Issue: Compile error

**Giải pháp:**
- Clean và rebuild:
  ```bash
  mvn clean compile
  ```

### Issue: Runtime error

**Kiểm tra logs:**
- Xem application logs để tìm error message
- Check database connection
- Verify partition tables tồn tại

---

## Files đã thay đổi

1. **LogEntryRepository.java** (lines 196-250)
   - Thêm `filterByDateRange()`
   - Thêm `countFilterByDateRange()`

2. **LogEntryService.java** (lines 125-191)
   - Thêm `filterLogEntriesByDateRange()`

3. **LogEntryController.java** (lines 130-183)
   - Update endpoint `/filter` để dùng method mới

---

## Kết luận

API mới:
✅ Đơn giản hơn
✅ Dễ maintain hơn
✅ Không có type mismatch error
✅ Performance tốt hơn (ít parameters)
✅ Tập trung vào use case chính: filter theo thời gian

**Lưu ý:** API cũ (`getAllLogEntries`) vẫn còn trong code nhưng không được dùng nữa. Có thể giữ lại để backward compatibility hoặc xóa đi sau khi verify API mới hoạt động tốt.
