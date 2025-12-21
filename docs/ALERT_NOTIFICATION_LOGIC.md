# Logic Gửi Cảnh Báo Log Theo Mức Độ

## Tổng quan

Tài liệu này mô tả luồng xử lý gửi cảnh báo (alert notification) khi hệ thống nhận được bản ghi mới trong bảng `log_entries`. Backend cần implement logic để tự động gửi cảnh báo đến các kênh phù hợp dựa trên cấu hình hệ thống.

---

## Sơ đồ luồng xử lý (Flow Diagram)

```
┌─────────────────────┐
│   log_entries       │
│   (Bản ghi mới)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Lấy thông tin từ log_entry                         │
│  - severity (Mức độ cảnh báo: CRITICAL, MAJOR, MINOR, etc.) │
│  - system_name (Tên hệ thống phát sinh log)                 │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Tìm System Catalog theo system_name                 │
│  → Lấy system_level_id từ bảng system_catalog               │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Tìm Alert Rule phù hợp                              │
│  - Điều kiện: severity + system_level + status = ACTIVE     │
│  → Lấy alert_channels (SMS, ECHAT, CALL)                    │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Xử lý theo từng kênh cảnh báo                       │
│  ├── ECHAT  → Lấy group_contact → Gửi đến Echatwork         │
│  ├── SMS    → [PENDING - Chưa có nghiệp vụ]                 │
│  └── CALL   → [PENDING - Chưa có nghiệp vụ]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Chi tiết các bước xử lý

### STEP 1: Nhận bản ghi từ `log_entries`

Khi có bản ghi mới được insert vào bảng `log_entries`, cần lấy các thông tin sau:

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | number | ID bản ghi log |
| `severity` | string | Mức độ cảnh báo: `CRITICAL`, `MAJOR`, `MINOR`, `WARNING`, `DOWN` |
| `system_name` | string | Tên hệ thống phát sinh log (dùng để lookup SystemCatalog) |
| `occurred_at` | timestamp | Thời điểm xảy ra sự kiện |
| `alarm_name` | string | Tên cảnh báo |
| `event_detail` | string | Chi tiết sự kiện |
| `host_name` | string | Tên host |
| `host_ip` | string | Địa chỉ IP |

**Trigger:** Có thể sử dụng một trong các cách sau:
- Database trigger (PostgreSQL)
- Message queue listener (Kafka, RabbitMQ)
- Scheduled job polling
- Event-driven từ API insert log

---

### STEP 2: Tìm System Catalog theo `system_name`

**Mục đích:** Lấy `system_level_id` của hệ thống phát sinh log.

**Query:**
```sql
SELECT
    sc.id,
    sc.code,
    sc.name,
    sc.system_level_id,
    sl.level as system_level,
    sl.description as level_description
FROM system_catalog sc
LEFT JOIN system_level sl ON sc.system_level_id = sl.id
WHERE sc.name = :system_name
  AND sc.is_active = true
LIMIT 1;
```

**Kết quả:**
- Nếu tìm thấy → Lấy `system_level_id` để tiếp tục STEP 3
- Nếu không tìm thấy → Log warning và dừng xử lý (không có cấu hình cho hệ thống này)

---

### STEP 3: Tìm Alert Rule phù hợp

**Mục đích:** Tìm quy tắc cảnh báo (Alert Rule) khớp với `severity` và `system_level`, và đang ở trạng thái hoạt động.

**Query:**
```sql
SELECT
    ar.id,
    ar.code,
    ar.name,
    ar.description,
    ar.alert_channels,  -- VD: "SMS,ECHAT,CALL" hoặc "ECHAT"
    ar.status,
    sev.severity_code,
    sev.severity_name,
    sl.level as system_level
FROM alert_rule ar
LEFT JOIN sys_severity sev ON ar.severity_id = sev.id
LEFT JOIN system_level sl ON ar.system_level_id = sl.id
WHERE sev.severity_code = :severity          -- Khớp với severity của log
  AND ar.system_level_id = :system_level_id  -- Khớp với system_level của hệ thống
  AND ar.status = 1                          -- Chỉ lấy rule đang active
ORDER BY ar.id
LIMIT 1;
```

**Lưu ý:**
- `alert_channels` là chuỗi các kênh cảnh báo, phân cách bởi dấu phẩy
- Một log có thể khớp với nhiều Alert Rule, cần xác định logic ưu tiên (lấy rule đầu tiên hoặc xử lý tất cả)

---

### STEP 4: Xử lý theo từng kênh cảnh báo

Parse `alert_channels` thành danh sách và xử lý từng kênh:

```java
String[] channels = alertRule.getAlertChannels().split(",");
for (String channel : channels) {
    switch (channel.trim().toUpperCase()) {
        case "ECHAT":
            processEchatNotification(alertRule, logEntry);
            break;
        case "SMS":
            // TODO: Chưa có nghiệp vụ - để hàng đợi xử lý sau
            queueForLaterProcessing("SMS", alertRule, logEntry);
            break;
        case "CALL":
            // TODO: Chưa có nghiệp vụ - để hàng đợi xử lý sau
            queueForLaterProcessing("CALL", alertRule, logEntry);
            break;
        default:
            log.warn("Unknown channel: {}", channel);
    }
}
```

---

## Chi tiết xử lý kênh ECHAT

### 4.1. Lấy danh sách Group Contact từ Alert Rule

**Query:**
```sql
SELECT
    gc.id as group_contact_id,
    gc.name as group_name,
    gc.echat_id,           -- ID nhóm trên Echatwork
    gc.description,
    gc.is_active
FROM alert_rule_group_contact argc
JOIN group_contact gc ON argc.group_contact_id = gc.id
WHERE argc.alert_rule_id = :alert_rule_id
  AND gc.is_active = true;
```

**Kết quả:**
- Danh sách các nhóm Echatwork cần gửi cảnh báo
- Mỗi nhóm có `echat_id` là group ID trên hệ thống Echatwork

### 4.2. Xây dựng nội dung tin nhắn

**Template gợi ý:**
```
🚨 CẢNH BÁO HỆ THỐNG 🚨

📊 Mức độ: {severity}
🖥️ Hệ thống: {system_name}
🏠 Host: {host_name} ({host_ip})
⏰ Thời gian: {occurred_at}

📋 Alarm: {alarm_name}
📝 Chi tiết: {event_detail}

---
Log ID: {log_id}
```

**Mapping fields:**
| Placeholder | Source | Mô tả |
|-------------|--------|-------|
| `{severity}` | log_entries.severity | CRITICAL, MAJOR, MINOR, etc. |
| `{system_name}` | log_entries.system_name | Tên hệ thống |
| `{host_name}` | log_entries.host_name | Tên host |
| `{host_ip}` | log_entries.host_ip | Địa chỉ IP |
| `{occurred_at}` | log_entries.occurred_at | Format: dd/MM/yyyy HH:mm:ss |
| `{alarm_name}` | log_entries.alarm_name | Tên cảnh báo |
| `{event_detail}` | log_entries.event_detail | Chi tiết sự kiện |
| `{log_id}` | log_entries.id | ID bản ghi |

### 4.3. Gửi tin nhắn đến Echatwork

**Pseudo-code:**
```java
public void processEchatNotification(AlertRule alertRule, LogEntry logEntry) {
    // 1. Lấy danh sách group contacts
    List<GroupContact> groupContacts = getGroupContactsByAlertRuleId(alertRule.getId());

    if (groupContacts.isEmpty()) {
        log.warn("No group contacts configured for alert rule: {}", alertRule.getCode());
        return;
    }

    // 2. Build message content
    String message = buildAlertMessage(logEntry);

    // 3. Gửi đến từng group
    for (GroupContact group : groupContacts) {
        if (group.getEchatId() == null || group.getEchatId().isEmpty()) {
            log.warn("Group {} has no echat_id configured", group.getName());
            continue;
        }

        try {
            echatworkService.sendMessage(group.getEchatId(), message);

            // 4. Lưu log notification
            saveNotificationLog(
                logEntry.getId(),
                "ECHAT",
                group.getEchatId(),
                message,
                "SUCCESS"
            );

        } catch (Exception e) {
            log.error("Failed to send Echat notification to group {}: {}",
                group.getName(), e.getMessage());

            saveNotificationLog(
                logEntry.getId(),
                "ECHAT",
                group.getEchatId(),
                message,
                "FAILED",
                e.getMessage()
            );
        }
    }
}
```

### 4.4. Echatwork API Integration

**Endpoint gửi tin nhắn (tham khảo):**
```
POST https://echatwork.api.example.com/v1/rooms/{room_id}/messages
Authorization: Bearer {api_token}
Content-Type: application/json

{
    "message": "Nội dung tin nhắn..."
}
```

**Cần cấu hình:**
- `ECHATWORK_API_URL`: URL base của Echatwork API
- `ECHATWORK_API_TOKEN`: Token xác thực
- `ECHATWORK_TIMEOUT`: Timeout cho request (mặc định 30 giây)

---

## Xử lý kênh SMS và CALL (PENDING)

### SMS
- **Trạng thái:** Chưa có nghiệp vụ
- **Hành động tạm thời:** Lưu vào bảng `pending_notifications` để xử lý sau

### CALL
- **Trạng thái:** Chưa có nghiệp vụ
- **Hành động tạm thời:** Lưu vào bảng `pending_notifications` để xử lý sau

**Bảng pending_notifications (gợi ý):**
```sql
CREATE TABLE pending_notifications (
    id SERIAL PRIMARY KEY,
    log_entry_id INTEGER NOT NULL,
    alert_rule_id INTEGER NOT NULL,
    channel VARCHAR(20) NOT NULL,  -- 'SMS' hoặc 'CALL'
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, PROCESSED, CANCELLED
    payload JSONB,  -- Lưu thông tin cần thiết để xử lý sau
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    notes TEXT
);
```

---

## Bảng Notification Log

Lưu lại lịch sử gửi thông báo để tracking và debugging:

```sql
CREATE TABLE notification_log (
    id SERIAL PRIMARY KEY,
    log_entry_id INTEGER NOT NULL,
    alert_rule_id INTEGER,
    channel VARCHAR(20) NOT NULL,      -- ECHAT, SMS, CALL
    recipient VARCHAR(255) NOT NULL,   -- echat_id, phone number, etc.
    message TEXT,
    status VARCHAR(20) NOT NULL,       -- PENDING, SENT, FAILED
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (log_entry_id) REFERENCES log_entries(id)
);
```

---

## Entity Relationships

```
log_entries
    ├── severity (match với sys_severity.severity_code)
    └── system_name (match với system_catalog.name)
            │
            └── system_catalog
                    └── system_level_id → system_level
                            │
                            └── alert_rule
                                ├── severity_id → sys_severity
                                ├── system_level_id → system_level
                                ├── alert_channels (SMS, ECHAT, CALL)
                                │
                                └── alert_rule_group_contact
                                        └── group_contact_id → group_contact
                                                └── echat_id (Group ID của Echatwork)
```

---

## Cấu hình cần thiết

### Environment Variables

```properties
# Echatwork Configuration
ECHATWORK_API_URL=https://echatwork.api.example.com/v1
ECHATWORK_API_TOKEN=your-api-token-here
ECHATWORK_TIMEOUT_MS=30000

# Notification Settings
NOTIFICATION_RETRY_COUNT=3
NOTIFICATION_RETRY_DELAY_MS=5000

# Feature Flags
NOTIFICATION_SMS_ENABLED=false
NOTIFICATION_CALL_ENABLED=false
NOTIFICATION_ECHAT_ENABLED=true
```

### Application Properties (Spring Boot)

```yaml
notification:
  echatwork:
    api-url: ${ECHATWORK_API_URL}
    api-token: ${ECHATWORK_API_TOKEN}
    timeout-ms: ${ECHATWORK_TIMEOUT_MS:30000}
  retry:
    count: ${NOTIFICATION_RETRY_COUNT:3}
    delay-ms: ${NOTIFICATION_RETRY_DELAY_MS:5000}
  channels:
    sms-enabled: ${NOTIFICATION_SMS_ENABLED:false}
    call-enabled: ${NOTIFICATION_CALL_ENABLED:false}
    echat-enabled: ${NOTIFICATION_ECHAT_ENABLED:true}
```

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| System không tồn tại trong system_catalog | Log warning, skip notification |
| Không tìm thấy Alert Rule phù hợp | Log info (bình thường - không cần cảnh báo cho severity/level này) |
| Group Contact không có echat_id | Log warning, skip group đó, tiếp tục các group khác |
| Echatwork API lỗi | Retry theo cấu hình, log error, lưu trạng thái FAILED |
| Timeout khi gửi | Retry theo cấu hình, log error |

---

## Testing Checklist

- [ ] Log với severity CRITICAL được gửi đến đúng nhóm Echatwork
- [ ] Log với severity không có cấu hình không gây lỗi
- [ ] System không tồn tại trong system_catalog được handle đúng
- [ ] Group Contact không có echat_id được skip mà không crash
- [ ] Retry mechanism hoạt động khi Echatwork API lỗi
- [ ] Notification log được lưu đầy đủ (cả SUCCESS và FAILED)
- [ ] SMS/CALL được lưu vào pending_notifications

---

## Tóm tắt

1. **Nhận log** → Lấy `severity` và `system_name`
2. **Tìm system** → Lấy `system_level_id` từ `system_catalog`
3. **Tìm rule** → Lấy `alert_channels` từ `alert_rule` khớp với severity + system_level + status=ACTIVE
4. **Xử lý kênh:**
   - **ECHAT:** Lấy `group_contact.echat_id` → Gửi tin nhắn qua Echatwork API
   - **SMS/CALL:** Để hàng đợi xử lý sau

---

## Liên hệ

Nếu có câu hỏi về tài liệu này, vui lòng liên hệ team phát triển.

---

*Cập nhật lần cuối: 2025-12-21*
