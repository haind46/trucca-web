# Hướng dẫn cấu hình Environment Variables

## Hiểu về kiến trúc ứng dụng

**Đây là ứng dụng FULL-STACK**, không chỉ là frontend:

1. **Frontend**: React + Vite (được build thành static files)
2. **Backend**: Express.js API server
   - Serve frontend static files
   - Cung cấp REST API
   - **CẦN database để hoạt động**

## Biến môi trường BẮT BUỘC

### 1. DATABASE_URL

**Mục đích**: Kết nối đến PostgreSQL database

**Format**:
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Ví dụ**:

```bash
# PostgreSQL local
DATABASE_URL=postgresql://trucca_user:mypassword@localhost:5432/trucca

# PostgreSQL trên server khác
DATABASE_URL=postgresql://user:pass@10.3.62.100:5432/trucca_db

# Neon DB (serverless PostgreSQL - KHUYẾN NGHỊ)
DATABASE_URL=postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb
```

**Nếu không cung cấp**:
- App vẫn start được (hiển thị warning)
- Sẽ dùng `postgresql://localhost:5432/trucca`
- Các API calls liên quan database sẽ lỗi

**Cách tạo database**:

```bash
# Nếu dùng PostgreSQL local
createdb trucca

# Hoặc dùng Neon DB (FREE tier):
# 1. Đăng ký tại https://neon.tech
# 2. Tạo project mới
# 3. Copy connection string
```

### 2. OPENAI_API_KEY

**Mục đích**: Backend sử dụng OpenAI API cho AI features

**Format**:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**Bắt buộc**: Có - backend cần để khởi động

**Cách lấy**:
1. Đăng ký tại https://platform.openai.com
2. Tạo API key tại https://platform.openai.com/api-keys

**Nếu không dùng AI features**: Vẫn cần cung cấp một giá trị dummy
```bash
OPENAI_API_KEY=sk-dummy-key-not-used
```

### 3. SESSION_SECRET

**Mục đích**: Mã hóa session cookies

**Format**:
```bash
SESSION_SECRET=your-very-long-and-random-secret-string-here
```

**Yêu cầu**:
- Ít nhất 32 ký tự
- Random, không dự đoán được
- **KHÔNG được commit vào git**

**Cách tạo**:
```bash
# Linux/Mac
openssl rand -base64 32

# hoặc Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Biến môi trường TÙY CHỌN

### 4. PORT

**Mặc định**: 3000

```bash
PORT=3000
```

### 5. NODE_ENV

**Mặc định**: production (trong Docker)

```bash
NODE_ENV=production
```

### 6. VITE_API_URL

**Mặc định**: http://localhost:5000

```bash
VITE_API_URL=http://localhost:3000
```

**Lưu ý**: Biến này được dùng lúc BUILD frontend, không phải runtime

## File .env.production mẫu

```bash
# Application
NODE_ENV=production
PORT=3000

# Backend API URL (chỉ dùng lúc build)
VITE_API_URL=http://localhost:3000

# Database - CẬP NHẬT THÔNG TIN THỰC TẾ
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname

# Session Secret - TẠO MỚI GIÁ TRỊ RANDOM
SESSION_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234

# OpenAI API Key - CẬP NHẬT KEY THỰC
OPENAI_API_KEY=sk-proj-your-actual-api-key-here

# Logging
LOG_LEVEL=info
```

## Kiểm tra cấu hình

Sau khi start container:

```bash
# Xem logs, kiểm tra warning
docker logs trucca-web

# Nếu thấy warning này, cần cập nhật DATABASE_URL:
# ⚠️  DATABASE_URL not set. Using default connection string...

# Kiểm tra env variables trong container
docker exec trucca-web env | grep DATABASE_URL

# Test health endpoint
curl http://localhost:3000/api/health
```

## Troubleshooting

### Container restart liên tục

```bash
# Xem logs chi tiết
docker logs trucca-web --tail 50

# Thường do:
# - DATABASE_URL sai format
# - Database không kết nối được
# - OPENAI_API_KEY thiếu
```

### Lỗi "Cannot connect to database"

```bash
# Kiểm tra DATABASE_URL đúng format
echo $DATABASE_URL

# Test kết nối từ server
psql "$DATABASE_URL" -c "SELECT 1"

# Hoặc từ trong container
docker exec -it trucca-web sh
node -e "console.log(process.env.DATABASE_URL)"
```

### API calls trả về 500 error

Thường do database không kết nối được. Kiểm tra:
1. DATABASE_URL đúng
2. Database server đang chạy
3. Network có thể kết nối đến database
4. Firewall không block port 5432
