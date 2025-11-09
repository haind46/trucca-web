# Trực Ca AI - Operations Monitoring Platform (Frontend)

## Tổng quan dự án

Trực Ca AI là một nền tảng giám sát và cảnh báo hệ thống IT với AI, được xây dựng để quản lý cơ sở hạ tầng và hệ thống qua các ca trực. Nền tảng tự động thu thập dữ liệu từ nhiều nguồn (ELK, Prometheus, Polestar, application logs), phân tích sự cố bằng AI, tạo cảnh báo thông minh và hỗ trợ phối hợp ca trực với thông báo đa kênh tự động.

### Kiến trúc hệ thống

**Frontend (Repository này):**
- React 18 với TypeScript
- Vite cho build tooling và development server
- Wouter cho client-side routing
- TanStack Query (React Query) cho server state management
- Shadcn/ui component library (Radix UI + Tailwind CSS)
- **Kết nối API Backend qua port localhost:8002**

**Backend (Repository riêng):**
- Node.js với Express.js framework
- PostgreSQL database
- RESTful API endpoints
- AI Services, Notifications, Database layer

---

## Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file .env từ template
cp .env.example .env

# 3. Đảm bảo backend đang chạy tại http://localhost:8002

# 4. Chạy frontend
npm run dev

# Frontend sẽ chạy tại http://localhost:5173
```

---

## Cài đặt và Chạy Dự án Frontend

### Yêu cầu

- Node.js 18+
- Backend API đang chạy tại `http://localhost:8002`

### Bước 1: Cài đặt Dependencies

```bash
npm install
```

### Bước 2: Cấu hình API Backend

Tạo file `.env` trong thư mục gốc dự án:

```env
# API Backend URL
VITE_API_URL=http://localhost:8002

# Frontend Port (Tùy chọn, mặc định 5173 cho Vite)
VITE_PORT=5173
```

**Lưu ý quan trọng:**
- Frontend **KHÔNG** kết nối trực tiếp đến database
- Tất cả dữ liệu được lấy từ Backend API qua port 8002
- Backend phải đang chạy trước khi start frontend

### Bước 3: Cấu hình Proxy (Đã có sẵn)

File `vite.config.ts` đã được cấu hình sẵn để proxy các API calls:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      }
    }
  }
})
```

### Bước 4: Chạy Frontend Development Server

```bash
npm run dev
```

hoặc chỉ chạy frontend với Vite:

```bash
npx vite
```

Frontend sẽ chạy tại: **http://localhost:5173** (hoặc port bạn chỉ định trong VITE_PORT)

### Kiểm tra kết nối Backend

Sau khi chạy frontend, mở browser console và kiểm tra:
- Các API calls đến `/api/*` sẽ được proxy tới `http://localhost:8002/api/*`
- Nếu backend chưa chạy, bạn sẽ thấy lỗi connection refused

---

## Các Lệnh Scripts

| Script | Lệnh | Mô tả |
|--------|------|-------|
| **dev** | `npm run dev` | Chạy frontend development server (Vite) |
| **build** | `npm run build` | Build production frontend |
| **preview** | `npm run preview` | Preview production build |
| **check** | `npm run check` | Kiểm tra TypeScript errors |

**Lưu ý:** Các lệnh liên quan đến backend (`db:push`, `server`, v.v.) được quản lý ở repository backend riêng.

---

## API Backend Endpoints

Frontend gọi các API endpoints sau từ Backend (http://localhost:8002):

### Systems
- `GET /api/systems` - Lấy danh sách systems
- `POST /api/systems` - Tạo system mới
- `PUT /api/systems/:id` - Cập nhật system
- `DELETE /api/systems/:id` - Xóa system

### Contacts
- `GET /api/contacts` - Lấy danh sách contacts
- `POST /api/contacts` - Tạo contact mới
- `PUT /api/contacts/:id` - Cập nhật contact
- `DELETE /api/contacts/:id` - Xóa contact

### Groups
- `GET /api/groups` - Lấy danh sách groups
- `POST /api/groups` - Tạo group mới
- `PUT /api/groups/:id` - Cập nhật group
- `DELETE /api/groups/:id` - Xóa group

### Alert Rules
- `GET /api/alert-rules` - Lấy danh sách rules
- `POST /api/alert-rules` - Tạo rule mới
- `PUT /api/alert-rules/:id` - Cập nhật rule
- `DELETE /api/alert-rules/:id` - Xóa rule

### Alerts
- `GET /api/alerts` - Lấy danh sách alerts
- `POST /api/alerts` - Tạo alert mới
- `PUT /api/alerts/:id` - Cập nhật alert
- `DELETE /api/alerts/:id` - Xóa alert
- `POST /api/alerts/:id/acknowledge` - Xác nhận alert

### Schedules
- `GET /api/schedules` - Lấy danh sách schedules
- `POST /api/schedules` - Tạo schedule mới
- `PUT /api/schedules/:id` - Cập nhật schedule
- `DELETE /api/schedules/:id` - Xóa schedule

### Incidents
- `GET /api/incidents` - Lấy danh sách incidents
- `POST /api/incidents` - Tạo incident mới
- `PUT /api/incidents/:id` - Cập nhật incident
- `DELETE /api/incidents/:id` - Xóa incident

### Statistics
- `GET /api/statistics` - Lấy thống kê tổng quan

---

## Cấu trúc Database (Tham khảo cho Backend)

**Lưu ý:** Database được quản lý bởi Backend. Frontend chỉ nhận dữ liệu qua API.

### Systems (Hệ thống giám sát)
```typescript
{
  id: number,
  name: string,           // Tên hệ thống
  ip: string,             // Địa chỉ IP
  level: number,          // Mức độ quan trọng (1-3)
  polestarCode: string,   // Mã Polestar
  chatworkGroupId: string,
  status: string,         // clear | minor | major | critical | down
  createdAt: timestamp
}
```

### Contacts (Danh bạ nhân viên)
```typescript
{
  id: number,
  name: string,           // Tên nhân viên
  unit: string,           // Đơn vị
  email: string,
  phone: string,
  role: string,           // Team Leader | BO VH | BO KT | Developer
  createdAt: timestamp
}
```

### Groups (Nhóm)
```typescript
{
  id: number,
  name: string,           // Tên nhóm
  chatworkGroupId: string,
  memberIds: string[],    // Danh sách ID thành viên
  createdAt: timestamp
}
```

### Alert Rules (Quy tắc cảnh báo)
```typescript
{
  id: number,
  name: string,
  condition: string,      // Điều kiện trigger
  severity: string,       // minor | major | critical | down
  description: string,
  enabled: boolean,
  createdAt: timestamp
}
```

### Alerts (Cảnh báo)
```typescript
{
  id: number,
  systemId: number,
  severity: string,
  message: string,
  details: string,        // Chi tiết log
  acknowledged: boolean,
  acknowledgedBy: string,
  acknowledgedAt: timestamp,
  resolved: boolean,
  resolvedBy: string,
  resolvedAt: timestamp,
  createdAt: timestamp
}
```

### Schedules (Lịch trực ca)
```typescript
{
  id: number,
  contactId: number,
  systemId: number,
  shift: string,          // Ca sáng | Ca chiều | Ca đêm
  startTime: string,      // HH:mm
  endTime: string,        // HH:mm
  date: string,           // DD/MM/YYYY
  createdAt: timestamp
}
```

### Incidents (Sự cố)
```typescript
{
  id: number,
  alertId: number,
  systemId: number,
  title: string,
  description: string,
  severity: string,
  status: string,         // open | investigating | resolved
  assignedTo: string,
  aiAnalysis: string,     // Phân tích từ AI
  resolution: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Notifications (Thông báo)
```typescript
{
  id: number,
  incidentId: number,
  channel: string,        // chatwork | email | sms
  recipient: string,
  message: string,
  status: string,         // pending | sent | failed
  sentAt: timestamp,
  error: string,
  createdAt: timestamp
}
```

### Log Analysis (Phân tích log AI)
```typescript
{
  id: number,
  systemId: number,
  logContent: string,
  aiAnalysis: string,
  suggestedActions: string[],
  severity: string,
  createdAt: timestamp
}
```

---

## Cấu trúc Thư mục Frontend

```
trucca-web/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── ui/       # Shadcn/ui components
│   │   ├── lib/          # Utilities & helpers
│   │   ├── pages/        # Page components
│   │   └── hooks/        # Custom React hooks
│   ├── index.html
│   └── public/           # Static assets
│
├── shared/               # Shared types & schemas
│   └── schema.ts         # Type definitions từ backend
│
├── .env                  # Environment variables (tạo file này)
├── package.json
├── tsconfig.json
├── vite.config.ts        # Vite config với proxy setup
├── tailwind.config.ts    # Tailwind CSS config
└── postcss.config.js
```

**Lưu ý:**
- Thư mục `server/` chứa code mẫu, không sử dụng trong production vì bạn có backend riêng
- File `shared/schema.ts` chứa type definitions để đồng bộ với backend API

---

## Cấu hình Proxy cho Backend API

File `vite.config.ts` cần được cấu hình để proxy requests đến backend:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Frontend port
    proxy: {
      '/api': {
        target: 'http://localhost:8002', // Backend URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
```

**Cách hoạt động:**
- Frontend gọi: `fetch('/api/systems')`
- Vite proxy chuyển đến: `http://localhost:8002/api/systems`
- Response trả về frontend

### Thay đổi Backend URL

Nếu backend của bạn chạy ở URL/port khác, sửa trong `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://your-backend-host:your-port',
    changeOrigin: true,
  }
}
```

---

## Tính năng chính

### 1. Dashboard Giám sát
- Real-time system monitoring và status visualization
- Biểu đồ và metrics cho các hệ thống
- Alert list với phân loại theo mức độ nghiêm trọng

### 2. AI-Powered Log Analysis
- Tự động phân tích log bằng GPT-5-mini
- Đánh giá mức độ nghiêm trọng
- Gợi ý hành động khắc phục
- Báo cáo bằng tiếng Việt

### 3. Multi-Channel Notifications
- **Chatwork**: Kênh chính cho group notifications
- **Email**: Cho major/critical alerts
- **SMS**: Chỉ cho down/critical status

### 4. Shift Management
- Quản lý ca trực (sáng, chiều, đêm)
- Tự động route alerts theo lịch trực
- Calendar view cho schedules

### 5. Incident Tracking
- Gom nhóm alerts thành incidents
- Theo dõi resolution process
- Assignment và escalation

### 6. Configuration Management
- Quản lý systems, contacts, groups
- Alert rule builder
- System status configuration

---

## Troubleshooting

### Lỗi: "Failed to fetch" hoặc API calls không hoạt động
**Nguyên nhân:** Backend chưa chạy hoặc chạy sai port

**Giải pháp:**
1. Kiểm tra backend đang chạy tại `http://localhost:8002`
2. Test backend: Mở browser và truy cập `http://localhost:8002/api/systems`
3. Kiểm tra proxy config trong `vite.config.ts` đúng target

### Lỗi CORS (Cross-Origin Request)
**Nguyên nhân:** Backend chưa cấu hình CORS cho frontend

**Giải pháp:** Trong backend Express, thêm CORS middleware:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Port 5173 đã được sử dụng
**Giải pháp:**
- Đổi port trong `vite.config.ts`: `server: { port: 3000 }`
- Hoặc kill process: `netstat -ano | findstr :5173`

### Lỗi TypeScript
**Giải pháp:** Chạy `npm run check` để xem chi tiết errors

### Backend API trả về 404
**Giải pháp:**
- Kiểm tra route trong backend có prefix `/api` không
- Xác nhận endpoint path chính xác
- Check logs từ backend server

---

## Design System

Dự án sử dụng Material Design principles với:
- **Typography**: Inter font cho UI, JetBrains Mono cho code/data
- **Colors**: Severity-based theming (down, critical, major, minor, clear)
- **Components**: Shadcn/ui built on Radix UI
- **Responsive**: Mobile-first approach với breakpoints

Chi tiết xem trong [design_guidelines.md](design_guidelines.md)

---

## Quản lý Images & Assets

Hướng dẫn chi tiết về cách tổ chức và sử dụng hình ảnh, icons, backgrounds trong dự án:

**Cấu trúc thư mục:**
- `client/public/images/` - Static assets (backgrounds, logos lớn)
- `client/src/assets/` - Bundled assets (icons, images trong components)
- `attached_assets/` - Design files, mockups (không deploy)

**Xem hướng dẫn đầy đủ:** [ASSETS_GUIDE.md](ASSETS_GUIDE.md)

---

## Environment Variables Reference (Frontend)

Tạo file `.env` trong thư mục gốc:

```env
# Backend API URL
VITE_API_URL=http://localhost:8002

# Frontend Port (Tùy chọn)
VITE_PORT=5173

# Environment
NODE_ENV=development
```

**Lưu ý:**
- Biến môi trường Vite phải có prefix `VITE_` để được expose ra client
- Các biến database, AI services, email, SMS được quản lý ở Backend

---

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

MIT

---

## Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.
