# Hướng dẫn Tích hợp Backend

## Tổng quan

Frontend này được thiết kế để kết nối với Backend API riêng qua **localhost:8002**. Frontend **KHÔNG** kết nối trực tiếp đến database.

## Kiến trúc

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────┐
│   Browser       │         │   Frontend      │         │   Backend    │
│                 │ ──────> │   (Port 5173)   │ ──────> │  (Port 8002) │
│   User          │         │   React + Vite  │         │   Express    │
└─────────────────┘         └─────────────────┘         └──────────────┘
                                    │                            │
                                    │ Proxy /api requests        │
                                    └───────────────────────────>│
                                                                 │
                                                          ┌──────▼──────┐
                                                          │  PostgreSQL │
                                                          │  Database   │
                                                          └─────────────┘
```

## Yêu cầu Backend

Backend của bạn cần cung cấp các RESTful API endpoints sau:

### 1. Systems Management
```
GET    /api/systems           - Lấy danh sách systems
POST   /api/systems           - Tạo system mới
GET    /api/systems/:id       - Lấy chi tiết system
PUT    /api/systems/:id       - Cập nhật system
DELETE /api/systems/:id       - Xóa system
```

### 2. Contacts Management
```
GET    /api/contacts          - Lấy danh sách contacts
POST   /api/contacts          - Tạo contact mới
GET    /api/contacts/:id      - Lấy chi tiết contact
PUT    /api/contacts/:id      - Cập nhật contact
DELETE /api/contacts/:id      - Xóa contact
```

### 3. Groups Management
```
GET    /api/groups            - Lấy danh sách groups
POST   /api/groups            - Tạo group mới
GET    /api/groups/:id        - Lấy chi tiết group
PUT    /api/groups/:id        - Cập nhật group
DELETE /api/groups/:id        - Xóa group
```

### 4. Alert Rules Management
```
GET    /api/alert-rules       - Lấy danh sách alert rules
POST   /api/alert-rules       - Tạo alert rule mới
GET    /api/alert-rules/:id   - Lấy chi tiết alert rule
PUT    /api/alert-rules/:id   - Cập nhật alert rule
DELETE /api/alert-rules/:id   - Xóa alert rule
```

### 5. Alerts Management
```
GET    /api/alerts                    - Lấy danh sách alerts
POST   /api/alerts                    - Tạo alert mới
GET    /api/alerts/:id                - Lấy chi tiết alert
PUT    /api/alerts/:id                - Cập nhật alert
DELETE /api/alerts/:id                - Xóa alert
POST   /api/alerts/:id/acknowledge    - Xác nhận alert
```

### 6. Schedules Management
```
GET    /api/schedules         - Lấy danh sách schedules
POST   /api/schedules         - Tạo schedule mới
GET    /api/schedules/:id     - Lấy chi tiết schedule
PUT    /api/schedules/:id     - Cập nhật schedule
DELETE /api/schedules/:id     - Xóa schedule
```

### 7. Incidents Management
```
GET    /api/incidents         - Lấy danh sách incidents
POST   /api/incidents         - Tạo incident mới
GET    /api/incidents/:id     - Lấy chi tiết incident
PUT    /api/incidents/:id     - Cập nhật incident
DELETE /api/incidents/:id     - Xóa incident
```

### 8. Statistics
```
GET    /api/statistics        - Lấy thống kê tổng quan
```

## Data Models (JSON Response Format)

### System
```typescript
{
  id: number;
  name: string;
  ip: string;
  level: number;              // 1-3
  polestarCode?: string;
  chatworkGroupId?: string;
  status: "clear" | "minor" | "major" | "critical" | "down";
  createdAt: string;          // ISO 8601 timestamp
}
```

### Contact
```typescript
{
  id: number;
  name: string;
  unit: string;
  email: string;
  phone: string;
  role: string;               // "Team Leader" | "BO VH" | "BO KT" | "Developer"
  createdAt: string;
}
```

### Group
```typescript
{
  id: number;
  name: string;
  chatworkGroupId?: string;
  memberIds: string[];        // Array of contact IDs
  createdAt: string;
}
```

### Alert Rule
```typescript
{
  id: number;
  name: string;
  condition: string;
  severity: "minor" | "major" | "critical" | "down";
  description?: string;
  enabled: boolean;
  createdAt: string;
}
```

### Alert
```typescript
{
  id: number;
  systemId: number;
  severity: "minor" | "major" | "critical" | "down";
  message: string;
  details?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}
```

### Schedule
```typescript
{
  id: number;
  contactId: number;
  systemId: number;
  shift: string;              // "Ca sáng" | "Ca chiều" | "Ca đêm"
  startTime: string;          // "HH:mm"
  endTime: string;            // "HH:mm"
  date: string;               // "DD/MM/YYYY"
  createdAt: string;
}
```

### Incident
```typescript
{
  id: number;
  alertId: number;
  systemId: number;
  title: string;
  description: string;
  severity: "minor" | "major" | "critical" | "down";
  status: "open" | "investigating" | "resolved";
  assignedTo?: number;        // Contact ID
  aiAnalysis?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Statistics
```typescript
{
  totalSystems: number;
  activeSystems: number;
  totalAlerts: number;
  criticalAlerts: number;
  openIncidents: number;
  // ... thêm các metrics khác nếu cần
}
```

## CORS Configuration

Backend cần enable CORS cho frontend origin. Ví dụ với Express:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Error Response Format

Tất cả API errors nên trả về format chuẩn:

```json
{
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing Backend Endpoints

Sử dụng curl hoặc Postman để test:

```bash
# Test GET systems
curl http://localhost:8002/api/systems

# Test POST system
curl -X POST http://localhost:8002/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Server",
    "ip": "192.168.1.100",
    "level": 1
  }'

# Test with authentication (nếu cần)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8002/api/systems
```

## Authentication (Optional)

Nếu backend yêu cầu authentication:

1. Backend trả về token sau khi login
2. Frontend lưu token (localStorage hoặc cookie)
3. Mọi request gửi kèm token trong header:
   ```
   Authorization: Bearer <token>
   ```

Frontend sẽ cần được cập nhật để handle authentication flow.

## Database Schema Reference

Backend cần tạo các bảng với schema tương ứng. Xem file `shared/schema.ts` để biết chi tiết cấu trúc database.

Hoặc sử dụng file `server/seed.ts` như reference để tạo dữ liệu mẫu.

## Checklist Tích hợp

- [ ] Backend đang chạy tại port 8002
- [ ] Database đã được tạo và có dữ liệu
- [ ] CORS đã được cấu hình cho origin `http://localhost:5173`
- [ ] Tất cả API endpoints đã implement
- [ ] Response format đúng theo data models
- [ ] Error handling đã được implement
- [ ] Test tất cả endpoints bằng curl/Postman
- [ ] Frontend có thể kết nối và lấy dữ liệu thành công

## Troubleshooting

### Frontend không kết nối được Backend
1. Check backend có đang chạy không: `curl http://localhost:8002/api/systems`
2. Check CORS headers trong response
3. Xem browser console có lỗi gì
4. Kiểm tra Network tab trong DevTools

### CORS errors
- Đảm bảo backend có CORS middleware
- Origin phải là `http://localhost:5173`
- Credentials phải được enable nếu dùng cookies

### 404 errors
- Kiểm tra route path có `/api` prefix không
- Verify endpoint spelling chính xác
- Check backend logs

## Support

Nếu cần hỗ trợ tích hợp, vui lòng cung cấp:
1. Backend logs
2. Browser console errors
3. Network request/response từ DevTools
