# API QUẢN LÝ QUY TẮC CẢNH BÁO (ALERT RULE)

Base URL: `http://localhost:8002`

## Mô tả chung

API quản lý quy tắc cảnh báo - **Bảng trái tim của hệ thống Trực ảo AI** để làm việc với đội trucca-service. Quy tắc cảnh báo xác định ai sẽ nhận cảnh báo, qua kênh nào (SMS/CALL/ECHAT), khi hệ thống có sự cố.

---

## Cấu trúc Alert Rule Object

```json
{
  "id": 1,
  "code": "AR001",
  "name": "Cảnh báo hệ thống cấp 1 ngừng hoạt động",
  "description": "Quy tắc cảnh báo khi hệ thống cấp 1 ngừng hoạt động hoàn toàn",
  "systemLevel": {
    "id": 1,
    "level": "1",
    "description": "Hệ thống cấp độ 1"
  },
  "severity": {
    "id": "severity-uuid",
    "severityCode": "DOWN",
    "severityName": "Ngừng hoạt động",
    "colorCode": "#DC2626"
  },
  "alertChannels": "SMS,CALL,ECHAT",
  "status": 1,
  "createdAt": "2025-11-28T10:00:00",
  "updatedAt": "2025-11-28T11:00:00",
  "createdBy": "admin",
  "updatedBy": "admin"
}
```

---

## PHẦN 1: API CRUD CƠ BẢN

### 1. Lấy Danh Sách Alert Rules (List All)

#### Endpoint
```
GET /api/alert-rule
```

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | Integer | Không | 1 | Số trang (bắt đầu từ 1) |
| limit | Integer | Không | 10 | Số bản ghi trên mỗi trang |
| keyword | String | Không | - | Từ khóa tìm kiếm (tìm trong code, name, description) |
| sort_dir | String | Không | desc | Hướng sắp xếp: `asc` hoặc `desc` |
| sort_key | String | Không | code | Trường dùng để sắp xếp |

#### Request Example

```bash
GET http://localhost:8002/api/alert-rule?page=1&limit=10&sort_dir=desc&sort_key=code
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": {
    "data": [
      {
        "id": 1,
        "code": "AR001",
        "name": "Cảnh báo hệ thống cấp 1 ngừng hoạt động",
        "description": "Quy tắc cảnh báo khi hệ thống cấp 1 ngừng hoạt động",
        "systemLevel": {
          "id": 1,
          "level": "1",
          "description": "Hệ thống cấp độ 1"
        },
        "severity": {
          "id": "uuid-123",
          "severityCode": "DOWN",
          "severityName": "Ngừng hoạt động",
          "colorCode": "#DC2626"
        },
        "alertChannels": "SMS,CALL,ECHAT",
        "status": 1,
        "createdAt": "2025-11-28T10:00:00",
        "updatedAt": null,
        "createdBy": "admin",
        "updatedBy": null
      }
    ],
    "total": 10,
    "page": 0,
    "size": 10
  }
}
```

---

### 2. Lấy Alert Rule Theo ID

#### Endpoint
```
GET /api/alert-rule/{id}
```

#### Request Example

```bash
GET http://localhost:8002/api/alert-rule/1
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": {
    "id": 1,
    "code": "AR001",
    "name": "Cảnh báo hệ thống cấp 1 ngừng hoạt động",
    "description": "Quy tắc cảnh báo khi hệ thống cấp 1 ngừng hoạt động",
    "systemLevel": {
      "id": 1,
      "level": "1",
      "description": "Hệ thống cấp độ 1"
    },
    "severity": {
      "id": "uuid-123",
      "severityCode": "DOWN",
      "severityName": "Ngừng hoạt động",
      "colorCode": "#DC2626"
    },
    "alertChannels": "SMS,CALL,ECHAT",
    "status": 1,
    "createdAt": "2025-11-28T10:00:00",
    "updatedAt": null,
    "createdBy": "admin",
    "updatedBy": null
  }
}
```

---

### 3. Tạo Mới Alert Rule

#### Endpoint
```
POST /api/alert-rule/create
```

#### Request Body

```json
{
  "code": "AR999",
  "name": "Cảnh báo test",
  "description": "Mô tả quy tắc cảnh báo test",
  "systemLevelId": 1,
  "severityId": "severity-uuid-here",
  "alertChannels": "SMS,ECHAT",
  "status": 1,
  "createdBy": "admin",
  "roleIds": [1, 2],
  "contactIds": [1, 2, 3],
  "groupContactIds": [1]
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | String | Không | Mã quy tắc (tự sinh nếu không truyền) |
| name | String | **Có** | Tên quy tắc |
| description | String | Không | Mô tả chi tiết |
| systemLevelId | Long | Không | ID cấp độ hệ thống (1,2,3) |
| severityId | String | Không | ID mức độ cảnh báo (DOWN, CRITICAL, MAJOR, MINOR) |
| alertChannels | String | Không | Kênh cảnh báo (SMS,CALL,ECHAT) |
| status | Integer | Không | 1=active, 0=inactive (mặc định 1) |
| createdBy | String | Không | Người tạo |
| roleIds | List<Integer> | Không | Danh sách role IDs cần gán |
| contactIds | List<Integer> | Không | Danh sách contact IDs cần gán |
| groupContactIds | List<Integer> | Không | Danh sách group contact IDs cần gán |

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": {
    "id": 11,
    "code": "AR999",
    "name": "Cảnh báo test",
    "description": "Mô tả quy tắc cảnh báo test",
    "systemLevel": {
      "id": 1,
      "level": "1",
      "description": "Hệ thống cấp độ 1"
    },
    "severity": {
      "id": "severity-uuid",
      "severityCode": "CRITICAL",
      "severityName": "Nghiêm trọng",
      "colorCode": "#EF4444"
    },
    "alertChannels": "SMS,ECHAT",
    "status": 1,
    "createdAt": "2025-11-28T12:00:00",
    "updatedAt": null,
    "createdBy": "admin",
    "updatedBy": null
  }
}
```

---

### 4. Sửa Alert Rule

#### Endpoint
```
POST /api/alert-rule/edit?id={id}
```

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Integer | **Có** | ID của alert rule cần sửa |

#### Request Body

```json
{
  "name": "Cảnh báo test đã sửa",
  "description": "Mô tả đã cập nhật",
  "systemLevelId": 2,
  "severityId": "new-severity-id",
  "alertChannels": "SMS,CALL,ECHAT",
  "status": 0,
  "createdBy": "admin",
  "roleIds": [1, 3],
  "contactIds": [2, 4],
  "groupContactIds": [1, 2]
}
```

**Lưu ý:** Các trường trong request body đều **optional**. Chỉ các trường được truyền sẽ được cập nhật.

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/edit?id=11
Content-Type: application/json

{
  "name": "Cảnh báo test đã sửa",
  "status": 0,
  "createdBy": "admin"
}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": {
    "id": 11,
    "code": "AR999",
    "name": "Cảnh báo test đã sửa",
    "description": "Mô tả đã cập nhật",
    "systemLevel": {
      "id": 2,
      "level": "2",
      "description": "Hệ thống cấp độ 2"
    },
    "severity": {
      "id": "new-severity-id",
      "severityCode": "MAJOR",
      "severityName": "Quan trọng",
      "colorCode": "#F59E0B"
    },
    "alertChannels": "SMS,CALL,ECHAT",
    "status": 0,
    "createdAt": "2025-11-28T12:00:00",
    "updatedAt": "2025-11-28T14:00:00",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

---

### 5. Xóa Alert Rule(s)

#### Endpoint
```
POST /api/alert-rule/delete?ids={ids}
```

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| ids | List<Integer> | **Có** | Danh sách IDs cần xóa (phân cách bằng dấu phẩy) |

#### Request Example

```bash
# Xóa 1 alert rule
POST http://localhost:8002/api/alert-rule/delete?ids=11

# Xóa nhiều alert rules
POST http://localhost:8002/api/alert-rule/delete?ids=11,12,13
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": null
}
```

---

### 6. Sao Chép Alert Rule

#### Endpoint
```
POST /api/alert-rule/copy?id={id}
```

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | Integer | **Có** | ID của alert rule cần sao chép |

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/copy?id=1
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Copied successfully",
  "statusCode": 200,
  "data": {
    "id": 12,
    "code": "AR011",
    "name": "Cảnh báo hệ thống cấp 1 ngừng hoạt động (Copy)",
    "description": "Quy tắc cảnh báo khi hệ thống cấp 1 ngừng hoạt động",
    "systemLevel": {
      "id": 1,
      "level": "1",
      "description": "Hệ thống cấp độ 1"
    },
    "severity": {
      "id": "uuid-123",
      "severityCode": "DOWN",
      "severityName": "Ngừng hoạt động",
      "colorCode": "#DC2626"
    },
    "alertChannels": "SMS,CALL,ECHAT",
    "status": 0,
    "createdAt": "2025-11-28T15:00:00",
    "updatedAt": null,
    "createdBy": "admin",
    "updatedBy": null
  }
}
```

**Lưu ý:** Alert rule được sao chép sẽ có:
- Mã mới (tự sinh)
- Tên có thêm " (Copy)"
- Trạng thái = 0 (inactive)
- Tất cả relationships (roles, contacts, group contacts) được sao chép

---

## PHẦN 2: API IMPORT/EXPORT

### 7. Export Alert Rules ra Excel

#### Endpoint
```
GET /api/alert-rule/export
```

#### Request Example

```bash
GET http://localhost:8002/api/alert-rule/export
```

#### Response Success (200 OK)

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Headers:**
```
Content-Disposition: attachment; filename=alert_rules_export.xlsx
```

**Body:** Binary Excel file (.xlsx)

#### Cấu trúc file Excel

| Cột | Mô tả |
|-----|-------|
| Mã quy tắc | AR001, AR002... |
| Tên quy tắc | Tên của quy tắc |
| Mô tả | Mô tả chi tiết |
| Cấp độ | 1, 2, 3 |
| Mức độ cảnh báo | DOWN, CRITICAL, MAJOR, MINOR |
| Kênh cảnh báo | SMS,CALL,ECHAT |
| Trạng thái | Active/Inactive |

---

### 8. Import Alert Rules từ Excel

#### Endpoint
```
POST /api/alert-rule/import
```

#### Request

**Content-Type:** `multipart/form-data`

```bash
POST http://localhost:8002/api/alert-rule/import
Content-Type: multipart/form-data

file: [Excel file]
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Imported 5 items",
  "statusCode": 200,
  "data": [
    {
      "id": 13,
      "code": "AR100",
      "name": "Imported Alert Rule 1",
      "description": "...",
      "systemLevel": {...},
      "severity": {...},
      "alertChannels": "SMS,ECHAT",
      "status": 1,
      "createdAt": "2025-11-28T16:00:00",
      "createdBy": "import"
    },
    ...
  ]
}
```

---

### 9. Tải Template Excel

#### Endpoint
```
GET /api/alert-rule/template
```

#### Request Example

```bash
GET http://localhost:8002/api/alert-rule/template
```

#### Response Success (200 OK)

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Headers:**
```
Content-Disposition: attachment; filename=alert_rules_template.xlsx
```

**Body:** Binary Excel template file với:
- Header row với tên cột
- 1 dòng dữ liệu mẫu

---

## PHẦN 3: API GÁN/BỎ GÁN ROLES

### 10. Lấy Danh Sách Roles Đã Gán

#### Endpoint
```
GET /api/alert-rule/{id}/roles
```

#### Request Example

```bash
GET http://localhost:8002/api/alert-rule/1/roles
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "alertRule": {
        "id": 1,
        "code": "AR001",
        "name": "..."
      },
      "role": {
        "id": 1,
        "name": "Lãnh đạo trung tâm",
        "description": "Lãnh đạo cấp trung tâm",
        "isActive": true
      },
      "createdAt": "2025-11-28T10:00:00",
      "createdBy": "admin"
    },
    {
      "id": 2,
      "alertRule": {
        "id": 1,
        "code": "AR001",
        "name": "..."
      },
      "role": {
        "id": 2,
        "name": "Lãnh đạo Phòng Vận hành",
        "description": "Trưởng/Phó phòng Vận hành",
        "isActive": true
      },
      "createdAt": "2025-11-28T10:00:00",
      "createdBy": "admin"
    }
  ]
}
```

---

### 11. Gán Roles Cho Alert Rule

#### Endpoint
```
POST /api/alert-rule/{id}/assign-roles
```

#### Request Body

```json
{
  "roleIds": [1, 2, 3],
  "createdBy": "admin"
}
```

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/1/assign-roles
Content-Type: application/json

{
  "roleIds": [1, 2, 3],
  "createdBy": "admin"
}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Roles assigned successfully",
  "statusCode": 200,
  "data": null
}
```

**Lưu ý:** Nếu role đã được gán trước đó, sẽ bỏ qua (idempotent).

---

### 12. Bỏ Gán Roles Khỏi Alert Rule

#### Endpoint
```
POST /api/alert-rule/{id}/unassign-roles
```

#### Request Body

```json
{
  "roleIds": [1, 2]
}
```

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/1/unassign-roles
Content-Type: application/json

{
  "roleIds": [1, 2]
}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Roles unassigned successfully",
  "statusCode": 200,
  "data": null
}
```

---

## PHẦN 4: API GÁN/BỎ GÁN CONTACTS

### 13. Lấy Danh Sách Contacts Đã Gán

#### Endpoint
```
GET /api/alert-rule/{id}/contacts
```

#### Request Example

```bash
GET http://localhost:8002/api/alert-rule/1/contacts
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "alertRule": {
        "id": 1,
        "code": "AR001",
        "name": "..."
      },
      "contact": {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@company.com",
        "phone": "0901234567",
        "isActive": true
      },
      "createdAt": "2025-11-28T10:00:00",
      "createdBy": "admin"
    }
  ]
}
```

---

### 14. Gán Contacts Cho Alert Rule

#### Endpoint
```
POST /api/alert-rule/{id}/assign-contacts
```

#### Request Body

```json
{
  "contactIds": [1, 2, 3, 4],
  "createdBy": "admin"
}
```

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/1/assign-contacts
Content-Type: application/json

{
  "contactIds": [1, 2, 3, 4],
  "createdBy": "admin"
}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Contacts assigned successfully",
  "statusCode": 200,
  "data": null
}
```

---

### 15. Bỏ Gán Contacts Khỏi Alert Rule

#### Endpoint
```
POST /api/alert-rule/{id}/unassign-contacts
```

#### Request Body

```json
{
  "contactIds": [1, 2]
}
```

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/1/unassign-contacts
Content-Type: application/json

{
  "contactIds": [1, 2]
}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Contacts unassigned successfully",
  "statusCode": 200,
  "data": null
}
```

---

## PHẦN 5: API GÁN/BỎ GÁN GROUP CONTACTS

### 16. Lấy Danh Sách Group Contacts Đã Gán

#### Endpoint
```
GET /api/alert-rule/{id}/group-contacts
```

#### Request Example

```bash
GET http://localhost:8002/api/alert-rule/1/group-contacts
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "SUCCESS",
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "alertRule": {
        "id": 1,
        "code": "AR001",
        "name": "..."
      },
      "groupContact": {
        "id": 1,
        "name": "Nhóm Khẩn cấp",
        "description": "Danh sách liên hệ khẩn cấp 24/7",
        "isActive": true
      },
      "createdAt": "2025-11-28T10:00:00",
      "createdBy": "admin"
    }
  ]
}
```

---

### 17. Gán Group Contacts Cho Alert Rule

#### Endpoint
```
POST /api/alert-rule/{id}/assign-group-contacts
```

#### Request Body

```json
{
  "groupContactIds": [1, 2, 3],
  "createdBy": "admin"
}
```

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/1/assign-group-contacts
Content-Type: application/json

{
  "groupContactIds": [1, 2, 3],
  "createdBy": "admin"
}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Group contacts assigned successfully",
  "statusCode": 200,
  "data": null
}
```

---

### 18. Bỏ Gán Group Contacts Khỏi Alert Rule

#### Endpoint
```
POST /api/alert-rule/{id}/unassign-group-contacts
```

#### Request Body

```json
{
  "groupContactIds": [1, 2]
}
```

#### Request Example

```bash
POST http://localhost:8002/api/alert-rule/1/unassign-group-contacts
Content-Type: application/json

{
  "groupContactIds": [1, 2]
}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Group contacts unassigned successfully",
  "statusCode": 200,
  "data": null
}
```

---

## LƯU Ý CHO FRONTEND

### 1. Response Structure

Tất cả API đều trả về cấu trúc CommonResponse:

```json
{
  "success": true/false,
  "message": "...",
  "statusCode": 200,
  "data": {...}
}
```

**Đối với API có phân trang** (GET /api/alert-rule):

```json
{
  "success": true,
  "data": {
    "data": [...],    // Mảng dữ liệu (KHÔNG phải "content")
    "total": 100,     // Tổng số items (KHÔNG phải "totalElements")
    "page": 0,        // Số trang hiện tại (0-indexed)
    "size": 10        // Số items mỗi trang
  }
}
```

**Tính totalPages:**
```javascript
const totalPages = Math.ceil(data.total / data.size);
```

### 2. Alert Channels Format

Kênh cảnh báo là chuỗi phân cách bằng dấu phẩy:
- `"SMS"` - Chỉ SMS
- `"CALL"` - Chỉ gọi điện
- `"ECHAT"` - Chỉ Echat
- `"SMS,CALL"` - SMS và gọi điện
- `"SMS,CALL,ECHAT"` - Tất cả kênh

**Parse channels:**
```javascript
const channels = alertRule.alertChannels?.split(',') || [];
const hasSMS = channels.includes('SMS');
const hasCALL = channels.includes('CALL');
const hasECHAT = channels.includes('ECHAT');
```

### 3. Status Values

- `1` = Active (Đang hoạt động)
- `0` = Inactive (Tạm ngừng)

### 4. Auto-generate Code

Nếu không truyền `code` khi tạo mới, backend sẽ tự sinh mã theo format `AR001`, `AR002`,...

### 5. Relationships

Khi tạo/sửa alert rule, có thể truyền luôn danh sách IDs để gán:
- `roleIds`: Danh sách role IDs
- `contactIds`: Danh sách contact IDs
- `groupContactIds`: Danh sách group contact IDs

Hoặc dùng các API assign/unassign riêng biệt sau khi tạo/sửa.

### 6. Validation Rules

- `name`: Bắt buộc, tối đa 200 ký tự
- `code`: Tối đa 50 ký tự, unique
- `alertChannels`: Chỉ chứa SMS, CALL, ECHAT (regex: `^(SMS|CALL|ECHAT)(,(SMS|CALL|ECHAT))*$`)
- `status`: 0 hoặc 1

---

## CODE EXAMPLES

### JavaScript/TypeScript Example

```javascript
// 1. Lấy danh sách alert rules
async function getAlertRules(page = 1, limit = 10, keyword = '') {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_dir: 'desc',
    sort_key: 'code'
  });

  if (keyword) params.append('keyword', keyword);

  const response = await fetch(
    `http://localhost:8002/api/alert-rule?${params.toString()}`
  );

  const result = await response.json();
  return result.data;
}

// 2. Tạo mới alert rule
async function createAlertRule(data) {
  const response = await fetch('http://localhost:8002/api/alert-rule/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      systemLevelId: data.systemLevelId,
      severityId: data.severityId,
      alertChannels: data.channels.join(','), // ['SMS', 'ECHAT'] => 'SMS,ECHAT'
      status: data.status ? 1 : 0,
      createdBy: 'admin',
      roleIds: data.roleIds,
      contactIds: data.contactIds,
      groupContactIds: data.groupContactIds
    })
  });

  const result = await response.json();
  return result.data;
}

// 3. Gán roles cho alert rule
async function assignRoles(alertRuleId, roleIds) {
  const response = await fetch(
    `http://localhost:8002/api/alert-rule/${alertRuleId}/assign-roles`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roleIds: roleIds,
        createdBy: 'admin'
      })
    }
  );

  return await response.json();
}

// 4. Export to Excel
async function exportAlertRules() {
  const response = await fetch('http://localhost:8002/api/alert-rule/export');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'alert_rules_export.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// 5. Import from Excel
async function importAlertRules(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8002/api/alert-rule/import', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.data;
}
```

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';

interface AlertRule {
  id: number;
  code: string;
  name: string;
  description: string;
  systemLevel?: {
    id: number;
    level: string;
  };
  severity?: {
    severityCode: string;
    severityName: string;
    colorCode: string;
  };
  alertChannels: string;
  status: number;
}

const AlertRuleList: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlertRules();
  }, []);

  const fetchAlertRules = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8002/api/alert-rule?page=${page}&limit=${limit}`
      );
      const result = await response.json();

      if (result.success) {
        setAlertRules(result.data.data);
        setPagination({
          page: result.data.page,
          size: result.data.size,
          total: result.data.total
        });
      }
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlertRule = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa quy tắc này?')) return;

    try {
      const response = await fetch(
        `http://localhost:8002/api/alert-rule/delete?ids=${id}`,
        { method: 'POST' }
      );
      const result = await response.json();

      if (result.success) {
        alert('Xóa thành công!');
        fetchAlertRules();
      }
    } catch (error) {
      console.error('Error deleting alert rule:', error);
    }
  };

  const getSeverityBadgeColor = (severityCode: string) => {
    switch (severityCode) {
      case 'DOWN': return 'red';
      case 'CRITICAL': return 'orange';
      case 'MAJOR': return 'yellow';
      case 'MINOR': return 'green';
      default: return 'gray';
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.size);

  return (
    <div>
      <h1>Quản lý Quy tắc Cảnh báo</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên</th>
              <th>Cấp độ</th>
              <th>Mức độ</th>
              <th>Kênh</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {alertRules.map(rule => (
              <tr key={rule.id}>
                <td>{rule.code}</td>
                <td>{rule.name}</td>
                <td>{rule.systemLevel?.level || '-'}</td>
                <td>
                  <span style={{
                    color: getSeverityBadgeColor(rule.severity?.severityCode || ''),
                    fontWeight: 'bold'
                  }}>
                    {rule.severity?.severityName || '-'}
                  </span>
                </td>
                <td>{rule.alertChannels}</td>
                <td>{rule.status === 1 ? 'Active' : 'Inactive'}</td>
                <td>
                  <button onClick={() => deleteAlertRule(rule.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button
          disabled={pagination.page === 0}
          onClick={() => fetchAlertRules(pagination.page, pagination.size)}
        >
          Previous
        </button>
        <span>
          Page {pagination.page + 1} of {totalPages}
        </span>
        <button
          disabled={pagination.page + 1 >= totalPages}
          onClick={() => fetchAlertRules(pagination.page + 2, pagination.size)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AlertRuleList;
```

---

## TỔNG KẾT

API Alert Rule cung cấp **18 endpoints đầy đủ** để quản lý quy tắc cảnh báo:

### CRUD Cơ bản (6 endpoints)
1. ✅ GET `/api/alert-rule` - List all
2. ✅ GET `/api/alert-rule/{id}` - Get by ID
3. ✅ POST `/api/alert-rule/create` - Tạo mới
4. ✅ POST `/api/alert-rule/edit?id={id}` - Sửa
5. ✅ POST `/api/alert-rule/delete?ids={ids}` - Xóa
6. ✅ POST `/api/alert-rule/copy?id={id}` - Sao chép

### Import/Export (3 endpoints)
7. ✅ GET `/api/alert-rule/export` - Export Excel
8. ✅ POST `/api/alert-rule/import` - Import Excel
9. ✅ GET `/api/alert-rule/template` - Download template

### Role Management (3 endpoints)
10. ✅ GET `/api/alert-rule/{id}/roles` - Lấy roles
11. ✅ POST `/api/alert-rule/{id}/assign-roles` - Gán roles
12. ✅ POST `/api/alert-rule/{id}/unassign-roles` - Bỏ gán roles

### Contact Management (3 endpoints)
13. ✅ GET `/api/alert-rule/{id}/contacts` - Lấy contacts
14. ✅ POST `/api/alert-rule/{id}/assign-contacts` - Gán contacts
15. ✅ POST `/api/alert-rule/{id}/unassign-contacts` - Bỏ gán contacts

### Group Contact Management (3 endpoints)
16. ✅ GET `/api/alert-rule/{id}/group-contacts` - Lấy group contacts
17. ✅ POST `/api/alert-rule/{id}/assign-group-contacts` - Gán group contacts
18. ✅ POST `/api/alert-rule/{id}/unassign-group-contacts` - Bỏ gán group contacts

**Tính năng sẵn sàng để tích hợp với trucca-service!** 🎉
