# Hướng dẫn Deploy với Docker Hub

## Workflow Deploy

### Bước 1: Build và Push Image lên Docker Hub (Trên máy local)

```bash
# 1. Login vào Docker Hub
docker login

# 2. Build image với tag
docker build -f Dockerfile.no-proxy -t haind46/trucca-web:latest .

# Hoặc build với version cụ thể
docker build -f Dockerfile.no-proxy -t haind46/trucca-web:v1.0.0 .
docker tag haind46/trucca-web:v1.0.0 haind46/trucca-web:latest

# 3. Push lên Docker Hub
docker push haind46/trucca-web:latest

# Nếu có version tag
docker push haind46/trucca-web:v1.0.0
```

### Bước 2: Deploy trên Server

```bash
# 1. Tạo thư mục cho ứng dụng
mkdir -p ~/trucca-web
cd ~/trucca-web

# 2. Copy các file cần thiết lên server
# - docker-compose.yml
# - .env.production
# Hoặc tạo trực tiếp trên server

# 3. Cập nhật .env.production với thông tin thực tế
nano .env.production

# 4. Pull và chạy container (KHÔNG cần proxy)
docker-compose pull
docker-compose up -d

# 5. Kiểm tra logs
docker-compose logs -f

# 6. Kiểm tra health
curl http://localhost:3000/api/health
```

## File cần có trên Server

### 1. docker-compose.yml

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
    env_file:
      - .env.production
    network_mode: "host"
    volumes:
      - ./logs:/app/logs
```

### 2. .env.production

```bash
# Application
NODE_ENV=production
PORT=3000

# Backend API URL
VITE_API_URL=http://localhost:3000

# Database (CẬP NHẬT THÔNG TIN THỰC TẾ)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Session Secret (THAY ĐỔI GIÁ TRỊ BẢO MẬT)
SESSION_SECRET=your-secure-random-string-here

# OpenAI API Key (BẮT BUỘC)
OPENAI_API_KEY=sk-your-actual-api-key

# Logging
LOG_LEVEL=info
```

## Update Image trên Server

```bash
# Pull image mới nhất
docker-compose pull

# Restart container
docker-compose down
docker-compose up -d

# Hoặc một lệnh
docker-compose pull && docker-compose up -d
```

## Build Multi-platform Image (Optional)

Nếu cần build cho cả Linux ARM64 (như server ARM):

```bash
# Setup buildx (chỉ cần làm 1 lần)
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap

# Build và push multi-platform
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f Dockerfile.no-proxy \
  -t haind46/trucca-web:latest \
  --push \
  .
```

## Troubleshooting

### Không pull được image từ Docker Hub

```bash
# Kiểm tra kết nối
docker pull hello-world

# Nếu bị proxy block, cấu hình Docker daemon
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo nano /etc/systemd/system/docker.service.d/http-proxy.conf

# Thêm nội dung:
[Service]
Environment="NO_PROXY=localhost,127.0.0.1,docker.io"

# Reload và restart Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### Container không start

```bash
# Xem logs chi tiết
docker logs trucca-web

# Kiểm tra env variables
docker exec trucca-web env

# Kiểm tra file .env.production
cat .env.production
```

### Update không có hiệu lực

```bash
# Force pull image mới
docker-compose pull --ignore-pull-failures

# Xóa container và image cũ
docker-compose down
docker rmi haind46/trucca-web:latest
docker-compose pull
docker-compose up -d
```

## CI/CD với GitHub Actions (Optional)

Tạo file `.github/workflows/docker-publish.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.no-proxy
          push: true
          tags: |
            haind46/trucca-web:latest
            haind46/trucca-web:${{ github.sha }}
```

Sau đó thêm secrets trong GitHub repository settings:
- `DOCKER_USERNAME`: haind46
- `DOCKER_PASSWORD`: Docker Hub token
