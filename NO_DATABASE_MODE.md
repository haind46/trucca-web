# No Database Mode - In-Memory Storage

## Tổng quan

Ứng dụng hiện đã được cấu hình để **KHÔNG CẦN database**. Tất cả data được lưu trong RAM (In-Memory Storage).

## Ưu điểm

✅ **Không cần cài đặt database** - Deploy cực kỳ đơn giản
✅ **Không cần cấu hình DATABASE_URL** - Chỉ cần OPENAI_API_KEY
✅ **Performance cao** - Truy xuất data từ RAM nhanh hơn database
✅ **Zero maintenance** - Không cần backup, migration, hoặc quản lý database

## Nhược điểm

⚠️ **Data không persist** - Khi restart container, tất cả data sẽ mất
⚠️ **Không scale được** - Chỉ chạy được 1 instance
⚠️ **Giới hạn memory** - Data size bị giới hạn bởi RAM

## Cách hoạt động

### InMemoryStorage Implementation

File [server/storage.ts](server/storage.ts) có 2 implementations:

1. **InMemoryStorage** (đang dùng) - Lưu data trong RAM
2. **DatabaseStorage** (đã comment) - Lưu data trong PostgreSQL

```typescript
// Đang dùng InMemoryStorage
export const storage = new InMemoryStorage();

// Nếu muốn dùng database, uncomment dòng dưới:
// export const storage = new DatabaseStorage();
```

### Data được lưu trong RAM

InMemoryStorage lưu trữ:
- Systems
- Contacts
- Groups
- Alert Rules
- Alerts
- Schedules
- Incidents
- Notifications
- Log Analysis

Tất cả data này **chỉ tồn tại khi container đang chạy**.

## Deploy trên Server

### Yêu cầu tối thiểu

Chỉ cần cung cấp **1 biến môi trường**:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### File docker-compose.yml

```yaml
version: '3.8'

services:
  trucca-web:
    image: haind46/trucca-web:latest
    container_name: trucca-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OPENAI_API_KEY=sk-your-api-key-here
    network_mode: "host"
    volumes:
      - ./logs:/app/logs
```

### Deploy đơn giản

```bash
# 1. Tạo thư mục
mkdir ~/trucca-web && cd ~/trucca-web

# 2. Tạo file docker-compose.yml (copy nội dung ở trên)

# 3. Chạy
docker-compose up -d

# 4. Kiểm tra
docker logs trucca-web
curl http://localhost:3000
```

**Không cần cấu hình database gì cả!**

## Chuyển sang Database Mode (nếu cần)

Nếu sau này cần persist data, làm theo các bước sau:

### 1. Sửa code

Edit [server/storage.ts](server/storage.ts):

```typescript
// Comment dòng này:
// export const storage = new InMemoryStorage();

// Uncomment các dòng này:
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export const storage = new DatabaseStorage();
```

### 2. Rebuild Docker image

```bash
docker build -f Dockerfile -t haind46/trucca-web:latest .
docker push haind46/trucca-web:latest
```

### 3. Cấu hình DATABASE_URL

Cập nhật [.env.production](.env.production):

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 4. Chạy migrations

```bash
npm run db:push
```

### 5. Deploy lại

```bash
docker-compose pull
docker-compose up -d
```

## So sánh 2 modes

| Feature | InMemoryStorage | DatabaseStorage |
|---------|----------------|-----------------|
| Setup complexity | ⭐ Cực đơn giản | ⭐⭐⭐ Phức tạp |
| Data persistence | ❌ Không | ✅ Có |
| Performance | ⭐⭐⭐ Rất nhanh | ⭐⭐ Nhanh |
| Scalability | ❌ 1 instance | ✅ Multi-instance |
| Maintenance | ⭐⭐⭐ Không cần | ⭐⭐ Cần backup/migration |
| Cost | ⭐⭐⭐ Rất rẻ | ⭐⭐ Trung bình |

## Use cases phù hợp với InMemoryStorage

✅ **Demo/POC** - Thử nghiệm nhanh
✅ **Development** - Không cần setup database local
✅ **Testing** - Clean state mỗi lần restart
✅ **Small deployments** - Ít user, ít data
✅ **Stateless apps** - Data không quan trọng

## Use cases NÊN dùng DatabaseStorage

🔴 **Production với nhiều user**
🔴 **Data quan trọng không thể mất**
🔴 **Cần analytics/reporting**
🔴 **Multi-instance deployment**
🔴 **Compliance/audit requirements**

## FAQ

### Q: Data có bị mất khi restart container không?
**A:** Có. Tất cả data trong RAM sẽ mất khi restart.

### Q: Có thể backup data được không?
**A:** Không có cơ chế backup tự động. Nếu cần backup, hãy chuyển sang DatabaseStorage.

### Q: Ứng dụng có chạy nhanh hơn với InMemoryStorage không?
**A:** Có, truy xuất RAM nhanh hơn nhiều so với database.

### Q: Có giới hạn về số lượng data không?
**A:** Có, bị giới hạn bởi RAM của container. Thông thường đủ cho vài nghìn records.

### Q: Có thể chạy nhiều container cùng lúc không?
**A:** Không nên, vì mỗi container sẽ có data riêng, không sync với nhau.

### Q: Session có bị mất khi restart không?
**A:** Có, vì session cũng lưu trong InMemoryStorage.
