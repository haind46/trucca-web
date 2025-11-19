# Deploy Frontend & Backend Riêng Biệt

## Kiến trúc mới

```
┌─────────────────────────────────────────┐
│  Browser                                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         http://server:3000
                  │
┌─────────────────┴───────────────────────┐
│  Frontend (Nginx) - Port 3000           │
│  - Serve static files                   │
│  - Proxy /api/* → backend:8002          │
└─────────────────┬───────────────────────┘
                  │
                  │ /api/* requests
                  ▼
┌─────────────────────────────────────────┐
│  Backend (Express) - Port 8002          │
│  - API endpoints                        │
│  - InMemoryStorage                      │
└─────────────────────────────────────────┘
```

## Files đã tạo

### 1. [Dockerfile.frontend](Dockerfile.frontend)
Build frontend với Nginx:
- Build React app → static files
- Serve với Nginx
- Proxy `/api/*` sang backend

### 2. [Dockerfile.backend](Dockerfile.backend)
Build backend Express API:
- Bundle server code với esbuild
- Chạy trên port 8002

### 3. [nginx.conf](nginx.conf)
Nginx config:
- Listen port 3000
- Serve static files từ `/usr/share/nginx/html`
- Proxy `/api/` → `http://trucca-backend:8002`

### 4. [docker-compose.yml](docker-compose.yml)
Orchestrate 2 services:
- `trucca-frontend`: port 3000
- `trucca-backend`: port 8002

## Build & Deploy

### Build images

```bash
# Build cả 2 images
docker-compose build

# Hoặc build riêng từng image
docker build -f Dockerfile.frontend -t haind46/trucca-frontend:latest .
docker build -f Dockerfile.backend -t haind46/trucca-backend:latest .

# Push lên Docker Hub
docker push haind46/trucca-frontend:latest
docker push haind46/trucca-backend:latest
```

### Deploy trên server

```bash
# 1. Copy docker-compose.yml và .env.production lên server
scp docker-compose.yml user@server:/opt/trucca/
scp .env.production user@server:/opt/trucca/

# 2. SSH vào server
ssh user@server
cd /opt/trucca

# 3. Pull images (nếu đã push lên Docker Hub)
docker-compose pull

# 4. Start services
docker-compose up -d

# 5. Kiểm tra
docker-compose ps
docker-compose logs -f
```

## Kiểm tra

### 1. Check containers đang chạy

```bash
docker ps
```

Kết quả mong đợi:
```
CONTAINER ID   IMAGE                             STATUS    PORTS
xxx            haind46/trucca-frontend:latest    Up        0.0.0.0:3000->3000/tcp
yyy            haind46/trucca-backend:latest     Up        0.0.0.0:8002->8002/tcp
```

### 2. Test backend API

```bash
# Health check
curl http://localhost:8002/api/health

# Test systems endpoint
curl http://localhost:8002/api/systems
```

### 3. Test frontend

```bash
# Truy cập từ browser
http://server-ip:3000

# Test từ command line
curl http://localhost:3000
```

### 4. Test API qua frontend (thông qua Nginx proxy)

```bash
# Request này sẽ được Nginx proxy sang backend:8002
curl http://localhost:3000/api/systems
```

## Logs

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs riêng frontend
docker-compose logs -f trucca-frontend

# Xem logs riêng backend
docker-compose logs -f trucca-backend
```

## Troubleshooting

### Frontend không load được

```bash
# Check Nginx config
docker exec trucca-frontend cat /etc/nginx/conf.d/default.conf

# Check frontend files
docker exec trucca-frontend ls -la /usr/share/nginx/html
```

### API calls bị 502 Bad Gateway

```bash
# Check backend có chạy không
docker ps | grep trucca-backend

# Check backend logs
docker logs trucca-backend

# Test backend trực tiếp
curl http://localhost:8002/api/health
```

### Backend không start

```bash
# Check logs
docker logs trucca-backend

# Check environment variables
docker exec trucca-backend env | grep PORT
```

## Update & Rollback

### Update frontend

```bash
# Build image mới
docker build -f Dockerfile.frontend -t haind46/trucca-frontend:latest .
docker push haind46/trucca-frontend:latest

# Trên server
docker-compose pull trucca-frontend
docker-compose up -d trucca-frontend
```

### Update backend

```bash
# Build image mới
docker build -f Dockerfile.backend -t haind46/trucca-backend:latest .
docker push haind46/trucca-backend:latest

# Trên server
docker-compose pull trucca-backend
docker-compose up -d trucca-backend
```

### Rollback

```bash
# Pull version cũ
docker pull haind46/trucca-frontend:v1.0.0
docker pull haind46/trucca-backend:v1.0.0

# Update docker-compose.yml với version cụ thể
# Sau đó restart
docker-compose up -d
```

## Port Summary

| Service  | Internal Port | External Port | Purpose |
|----------|--------------|---------------|---------|
| Frontend | 3000         | 3000          | Web UI & Nginx proxy |
| Backend  | 8002         | 8002          | API endpoints |

## Network Flow

1. **User access**: `http://server:3000` → Frontend Nginx
2. **Static files**: Nginx serve từ `/usr/share/nginx/html`
3. **API calls**:
   - User → `http://server:3000/api/systems`
   - Nginx proxy → `http://trucca-backend:8002/api/systems`
   - Backend xử lý và trả về JSON
