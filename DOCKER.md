# Hướng dẫn chạy ứng dụng với Docker / Docker Guide

## Yêu cầu / Requirements

- Docker Desktop hoặc Docker Engine đã được cài đặt
- Docker Compose (thường đi kèm với Docker Desktop)

## Cách chạy / How to Run

### 1. Build và chạy tất cả services / Build and run all services

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Build images cho backend và frontend
- Khởi động cả hai containers
- Tự động tạo network và kết nối các services

### 2. Xem logs / View logs

```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của backend
docker-compose logs -f backend

# Xem logs của frontend
docker-compose logs -f frontend
```

### 3. Dừng services / Stop services

```bash
docker-compose down
```

### 4. Dừng và xóa volumes / Stop and remove volumes

```bash
docker-compose down -v
```

 **Cảnh báo**: Lệnh này sẽ xóa dữ liệu database!

### 5. Rebuild images / Rebuild images

```bash
# Rebuild và restart
docker-compose up -d --build

# Hoặc rebuild không cache
docker-compose build --no-cache
```

## Truy cập ứng dụng / Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Cấu trúc Docker / Docker Structure

```
DHLSHIPPING/
 docker-compose.yml          # Cấu hình Docker Compose
 backend/
    Dockerfile              # Dockerfile cho backend
    .dockerignore           # Files bỏ qua khi build
 frontend/
     Dockerfile              # Dockerfile cho frontend
     nginx.conf              # Cấu hình Nginx
     .dockerignore           # Files bỏ qua khi build
```

## Các lệnh hữu ích / Useful Commands

### Kiểm tra trạng thái / Check status

```bash
docker-compose ps
```

### Vào trong container / Enter container

```bash
# Vào backend container
docker-compose exec backend sh

# Vào frontend container
docker-compose exec frontend sh
```

### Xem resource usage / View resource usage

```bash
docker stats
```

### Restart một service cụ thể / Restart specific service

```bash
docker-compose restart backend
docker-compose restart frontend
```

## Database / Database

Database SQLite được lưu trong volume:
- `./backend/database` - Chứa file database.sqlite

Dữ liệu sẽ được giữ lại khi restart containers, trừ khi bạn xóa volumes.

## Uploads / Uploads

Thư mục uploads được mount từ host:
- `./backend/uploads` - Chứa các file đã upload

## Troubleshooting / Troubleshooting

### Port đã được sử dụng / Port already in use

Nếu port 80 hoặc 5000 đã được sử dụng, bạn có thể thay đổi trong `docker-compose.yml`:

```yaml
ports:
  - "8080:80"      # Thay đổi port frontend
  - "5001:5000"    # Thay đổi port backend
```

### Xóa tất cả và bắt đầu lại / Clean everything and start fresh

```bash
# Dừng và xóa containers, networks, volumes
docker-compose down -v

# Xóa images
docker-compose rm -f

# Xóa tất cả images của project
docker images | grep dhl | awk '{print $3}' | xargs docker rmi -f
```

### Kiểm tra logs lỗi / Check error logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend
```

## Environment Variables / Environment Variables

Bạn có thể tạo file `.env` trong thư mục gốc để cấu hình:

```env
NODE_ENV=production
PORT=5000
```

Sau đó cập nhật `docker-compose.yml` để sử dụng file `.env`.

## Notes / Notes

- Backend chạy trên port 5000
- Frontend chạy trên port 80 (nginx)
- Frontend proxy các request `/api` và `/uploads` đến backend
- Database và uploads được mount từ host để dữ liệu được giữ lại

