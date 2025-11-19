# Hướng dẫn Build Docker Image

## Vấn đề với Proxy

Proxy server `http://10.3.62.5:3128` gặp vấn đề khi sử dụng với npm trong Docker build, gây ra lỗi "Exit handler never called".

## Giải pháp

### Option 1: Build LOCAL (không dùng proxy) - KHUYẾN NGHỊ

Nếu bạn đang build trên máy local có kết nối internet trực tiếp:

```bash
# Sử dụng Dockerfile không proxy
docker build -f Dockerfile.no-proxy -t trucca-web .

# Hoặc dùng docker-compose với Dockerfile khác
docker-compose -f docker-compose.no-proxy.yml build
```

### Option 2: Build trên SERVER với proxy

Nếu bắt buộc phải build trên server qua proxy, có 2 cách:

#### Cách 2a: Pre-download dependencies trước khi build

```bash
# 1. Trên máy local (có internet), tạo node_modules
npm install

# 2. Copy toàn bộ code (bao gồm node_modules) lên server
scp -r . user@server:/path/to/trucca-web/

# 3. Trên server, sửa Dockerfile để không cài lại dependencies:
# Comment dòng RUN npm install
# Dockerfile sẽ dùng node_modules đã có sẵn

# 4. Build
docker build -t trucca-web .
```

#### Cách 2b: Sử dụng Docker BuildKit với proxy config khác

Thêm vào `~/.docker/config.json` trên server:

```json
{
  "proxies": {
    "default": {
      "httpProxy": "http://10.3.62.5:3128",
      "httpsProxy": "http://10.3.62.5:3128",
      "noProxy": "localhost,127.0.0.1"
    }
  }
}
```

Sau đó build với:

```bash
DOCKER_BUILDKIT=1 docker build -t trucca-web .
```

### Option 3: Build LOCAL và push lên Registry

```bash
# 1. Build local (không cần proxy)
docker build -f Dockerfile.no-proxy -t your-registry/trucca-web:latest .

# 2. Push lên Docker Registry
docker push your-registry/trucca-web:latest

# 3. Trên server, pull image
docker pull your-registry/trucca-web:latest
```

## Chạy Container

Sau khi đã có image (bằng một trong các cách trên):

```bash
# Cập nhật .env.production với thông tin thực tế
nano .env.production

# Chạy container (KHÔNG dùng proxy ở runtime)
docker-compose up -d

# Hoặc chạy trực tiếp
docker run -d \
  --name trucca-web \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  --env-file .env.production \
  trucca-web

# Kiểm tra logs
docker logs -f trucca-web

# Kiểm tra health
curl http://localhost:3000/api/health
```

## Lưu ý quan trọng

1. **Runtime KHÔNG dùng proxy**: Container khi chạy sẽ KHÔNG sử dụng proxy, đảm bảo API calls không bị route qua proxy server
2. **Port**: Ứng dụng chạy trên port 3000
3. **Database**: Cần cập nhật `DATABASE_URL` trong `.env.production` nếu sử dụng database
4. **Session Secret**: Phải thay đổi `SESSION_SECRET` trong `.env.production` trước khi deploy production

## Troubleshooting

### Lỗi "vite: not found"
- Nguyên nhân: npm không cài được devDependencies
- Giải pháp: Dùng `Dockerfile.no-proxy` để build

### Container không start
- Kiểm tra logs: `docker logs trucca-web`
- Kiểm tra port conflict: `netstat -ano | findstr :3000`
- Kiểm tra env variables: `docker exec trucca-web env`
