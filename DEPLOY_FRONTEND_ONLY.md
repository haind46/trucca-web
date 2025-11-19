# Deploy Frontend với Nginx Reverse Proxy

## Kiến trúc

```
┌─────────────────────────────────────────┐
│  Browser                                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         http://server:3000
                  │
┌─────────────────┴───────────────────────┐
│  Frontend Container (Nginx)             │
│  - Serve React static files             │
│  - Reverse proxy /api/* → backend:8002  │
└─────────────────┬───────────────────────┘
                  │
                  │ /api/* requests
                  ▼
         http://localhost:8002
                  │
┌─────────────────┴───────────────────────┐
│  Backend Container (có sẵn)             │
│  - Express API                          │
│  - Port 8002                            │
└─────────────────────────────────────────┘
```

## Files quan trọng

### 1. [Dockerfile.prod](Dockerfile.prod)
- Build React app → static files
- Serve với Nginx Alpine
- Port: 3000

### 2. [nginx.conf](nginx.conf)
- Serve static files từ `/usr/share/nginx/html`
- **Proxy `/api/*` → `http://localhost:8002`**
- CORS headers
- Gzip compression

### 3. [docker-compose.yml](docker-compose.yml)
- 1 service duy nhất: `trucca-frontend`
- Network mode: `host` (để truy cập localhost:8002)

## Build & Deploy

### Bước 1: Build Docker image

```bash
# Build image
docker build -f Dockerfile.prod -t haind46/trucca-frontend:latest .

# Test local
docker run -d --name test-frontend --network host haind46/trucca-frontend:latest
docker logs test-frontend

# Nếu OK, stop test container
docker stop test-frontend && docker rm test-frontend

# Push lên Docker Hub
docker push haind46/trucca-frontend:latest
```

### Bước 2: Deploy trên server

```bash
# 1. Copy files cần thiết lên server
scp docker-compose.yml user@server:/opt/trucca/
scp nginx.conf user@server:/opt/trucca/

# 2. SSH vào server
ssh user@server
cd /opt/trucca

# 3. Pull image từ Docker Hub
docker pull haind46/trucca-frontend:latest

# 4. Start container
docker-compose up -d

# 5. Kiểm tra logs
docker logs trucca-frontend -f
```

## Cấu hình Backend URL

Mặc định trong [nginx.conf](nginx.conf#L18), backend URL là `http://localhost:8002`.

### Nếu backend ở host khác:

Edit [nginx.conf](nginx.conf):
```nginx
location /api/ {
    # Thay đổi URL backend
    proxy_pass http://your-backend-host:8002;
    # ...
}
```

Sau đó rebuild image:
```bash
docker build -f Dockerfile.prod -t haind46/trucca-frontend:latest .
docker push haind46/trucca-frontend:latest
```

### Nếu backend chạy trong Docker network:

Edit [docker-compose.yml](docker-compose.yml):
```yaml
services:
  trucca-frontend:
    # Bỏ network_mode: host
    networks:
      - backend-network

networks:
  backend-network:
    external: true  # Nếu network đã có sẵn
```

Edit [nginx.conf](nginx.conf):
```nginx
location /api/ {
    proxy_pass http://backend-container-name:8002;
    # ...
}
```

## Kiểm tra

### 1. Check container đang chạy

```bash
docker ps | grep trucca-frontend
```

### 2. Test frontend files

```bash
# Access từ browser
http://server-ip:3000

# Hoặc curl
curl http://localhost:3000
```

### 3. Test API proxy

```bash
# Request này sẽ được Nginx proxy sang backend:8002
curl http://localhost:3000/api/systems
```

### 4. Check Nginx logs

```bash
# Access logs
docker exec trucca-frontend cat /var/log/nginx/access.log

# Error logs
docker exec trucca-frontend cat /var/log/nginx/error.log
```

## Troubleshooting

### Lỗi 502 Bad Gateway khi gọi /api

**Nguyên nhân**: Nginx không kết nối được đến backend:8002

**Kiểm tra**:
```bash
# 1. Check backend có chạy không
docker ps | grep backend
netstat -tulpn | grep 8002

# 2. Test backend trực tiếp
curl http://localhost:8002/api/health

# 3. Check Nginx error logs
docker logs trucca-frontend | grep error
```

**Giải pháp**:
- Đảm bảo backend đang chạy ở port 8002
- Nếu backend chạy trong Docker, dùng network mode hoặc container name đúng
- Check firewall không block port 8002

### Lỗi 404 Not Found

**Nguyên nhân**: Nginx không tìm thấy static files

**Kiểm tra**:
```bash
# Check files có trong container không
docker exec trucca-frontend ls -la /usr/share/nginx/html
```

**Giải pháp**:
- Rebuild image: `docker build -f Dockerfile.prod -t haind46/trucca-frontend:latest .`

### Container không start

**Kiểm tra**:
```bash
docker logs trucca-frontend
```

**Thường gặp**:
- Port 3000 đã được dùng: `netstat -tulpn | grep 3000`
- Nginx config sai syntax: kiểm tra [nginx.conf](nginx.conf)

## Update Frontend

### Cách 1: Build image mới

```bash
# 1. Sửa code frontend
# 2. Build image mới
docker build -f Dockerfile.prod -t haind46/trucca-frontend:latest .
docker push haind46/trucca-frontend:latest

# 3. Trên server
docker pull haind46/trucca-frontend:latest
docker-compose down
docker-compose up -d
```

### Cách 2: Build trực tiếp trên server

```bash
# 1. Git pull code mới
git pull origin main

# 2. Build và restart
docker-compose build
docker-compose up -d
```

## Backup & Rollback

### Backup image hiện tại

```bash
# Tag version hiện tại trước khi update
docker tag haind46/trucca-frontend:latest haind46/trucca-frontend:v1.0.0
docker push haind46/trucca-frontend:v1.0.0
```

### Rollback về version cũ

```bash
# Pull version cũ
docker pull haind46/trucca-frontend:v1.0.0

# Tag lại thành latest
docker tag haind46/trucca-frontend:v1.0.0 haind46/trucca-frontend:latest

# Restart
docker-compose down
docker-compose up -d
```

## Logs

```bash
# Real-time logs
docker logs trucca-frontend -f

# Last 100 lines
docker logs trucca-frontend --tail 100

# Nginx access logs
docker exec trucca-frontend tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec trucca-frontend tail -f /var/log/nginx/error.log
```

## Performance Tips

### 1. Nginx caching

Thêm vào [nginx.conf](nginx.conf):
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Enable Brotli compression

```bash
# Install brotli module
docker exec trucca-frontend apk add nginx-mod-http-brotli

# Edit nginx.conf
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## Security

### 1. Giới hạn CORS origins

Edit [nginx.conf](nginx.conf):
```nginx
# Thay vì '*', chỉ cho phép domains cụ thể
add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com' always;
```

### 2. Hide Nginx version

Thêm vào [nginx.conf](nginx.conf):
```nginx
server_tokens off;
```

### 3. Rate limiting

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ...
}
```
