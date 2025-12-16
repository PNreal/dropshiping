# Hướng Dẫn Triển Khai Với Cursor / Cursor Deployment Guide

Hướng dẫn cách sử dụng Cursor AI để tự động triển khai code lên server.
Guide on how to use Cursor AI to automatically deploy code to server.

## 🚀 Các Cách Triển Khai / Deployment Methods

### 1. Triển Khai Local (Docker) / Local Deployment (Docker)

**Cách sử dụng / How to use:**

Bạn có thể yêu cầu Cursor chạy lệnh triển khai:
You can ask Cursor to run the deployment command:

```
"Cursor, hãy deploy ứng dụng lên local bằng Docker"
"Cursor, please deploy the application locally using Docker"
```

Hoặc chạy trực tiếp script:
Or run the script directly:

```powershell
.\deploy.ps1 -Mode local
```

**Script sẽ tự động:**
- Kiểm tra Docker đã cài đặt
- Build Docker images
- Start containers
- Kiểm tra health của containers

### 2. Triển Khai Lên Server Remote / Remote Server Deployment

**Cách sử dụng / How to use:**

Yêu cầu Cursor:
Ask Cursor:

```
"Cursor, hãy deploy lên server 34.124.152.52 với user 'ubuntu'"
"Cursor, please deploy to server 34.124.152.52 with user 'ubuntu'"
```

Hoặc chạy script với tham số:
Or run script with parameters:

```powershell
.\deploy.ps1 -Mode remote -ServerIP "34.124.152.52" -ServerUser "ubuntu" -ServerPath "/opt/dhlshipping"
```

**Yêu cầu / Requirements:**
- SSH key đã được setup
- Server đã có Docker và Docker Compose
- Code đã được upload lên server (hoặc dùng Git)

### 3. Sử Dụng Cursor Terminal / Using Cursor Terminal

Bạn có thể yêu cầu Cursor chạy các lệnh deployment trực tiếp:

**Ví dụ / Examples:**

```
"Cursor, hãy build và start Docker containers"
"Cursor, please build and start Docker containers"
```

```
"Cursor, hãy kiểm tra status của containers"
"Cursor, please check container status"
```

```
"Cursor, hãy xem logs của backend container"
"Cursor, please show backend container logs"
```

## 📋 Các Lệnh Thường Dùng / Common Commands

### Build và Deploy / Build and Deploy

```powershell
# Build images
docker compose build

# Start containers
docker compose up -d

# Build và start cùng lúc
docker compose up -d --build
```

### Kiểm Tra Status / Check Status

```powershell
# Xem containers đang chạy
docker compose ps

# Xem logs
docker compose logs -f

# Xem logs của một service cụ thể
docker compose logs -f backend
docker compose logs -f frontend
```

### Dừng và Khởi Động Lại / Stop and Restart

```powershell
# Dừng containers
docker compose down

# Khởi động lại
docker compose restart

# Khởi động lại một service
docker compose restart backend
```

### Update và Rebuild / Update and Rebuild

```powershell
# Pull code mới (nếu dùng Git)
git pull

# Rebuild và restart
docker compose up -d --build
```

## 🔧 Tự Động Hóa Với Cursor / Automation with Cursor

### Tạo Script Tự Động / Create Automated Script

Bạn có thể yêu cầu Cursor tạo script tự động:

```
"Cursor, hãy tạo script PowerShell để tự động:
1. Build frontend
2. Build backend  
3. Deploy lên Docker
4. Kiểm tra health"
```

### CI/CD với GitHub Actions / CI/CD with GitHub Actions

Bạn có thể yêu cầu Cursor tạo GitHub Actions workflow:

```
"Cursor, hãy tạo GitHub Actions workflow để tự động deploy khi push code lên main branch"
```

## 📝 Ví Dụ Sử Dụng Cursor / Cursor Usage Examples

### Ví Dụ 1: Deploy Local
```
User: "Cursor, hãy deploy ứng dụng lên local"
Cursor: [Chạy lệnh] .\deploy.ps1 -Mode local
```

### Ví Dụ 2: Deploy Remote
```
User: "Cursor, deploy lên server production"
Cursor: [Hỏi thông tin server] 
       [Sau đó chạy] .\deploy.ps1 -Mode remote -ServerIP "..." -ServerUser "..."
```

### Ví Dụ 3: Kiểm Tra và Fix Lỗi
```
User: "Cursor, containers không chạy được, hãy kiểm tra và fix"
Cursor: [Kiểm tra logs] docker compose logs
       [Phân tích lỗi]
       [Đề xuất và thực hiện fix]
```

### Ví Dụ 4: Update Code
```
User: "Cursor, hãy pull code mới và rebuild containers"
Cursor: [Chạy] git pull
       [Chạy] docker compose up -d --build
```

## 🛠️ Troubleshooting với Cursor / Troubleshooting with Cursor

### Khi Gặp Lỗi / When Encountering Errors

Bạn có thể hỏi Cursor:

```
"Cursor, tại sao container backend không start được?"
"Cursor, why is the backend container not starting?"
```

Cursor sẽ:
- Kiểm tra logs
- Phân tích lỗi
- Đề xuất giải pháp
- Thực hiện fix nếu có thể

### Kiểm Tra Health / Check Health

```
"Cursor, hãy kiểm tra health của tất cả containers"
"Cursor, please check health of all containers"
```

## 🎯 Best Practices / Best Practices

1. **Luôn test local trước / Always test locally first**
   ```
   "Cursor, hãy deploy local và test trước khi deploy production"
   ```

2. **Backup trước khi deploy / Backup before deploy**
   ```
   "Cursor, hãy backup database trước khi deploy"
   ```

3. **Kiểm tra logs sau deploy / Check logs after deploy**
   ```
   "Cursor, hãy xem logs sau khi deploy để đảm bảo không có lỗi"
   ```

4. **Sử dụng Git tags / Use Git tags**
   ```
   "Cursor, hãy tạo Git tag cho version này trước khi deploy"
   ```

## 📚 Tài Liệu Liên Quan / Related Documentation

- `PRODUCTION_DEPLOYMENT.md` - Hướng dẫn chi tiết triển khai production
- `QUICK_DEPLOY.md` - Hướng dẫn triển khai nhanh
- `scripts/deploy.sh` - Script deployment cho Linux
- `deploy.ps1` - Script deployment cho Windows (PowerShell)

## 💡 Tips / Tips

1. **Sử dụng Cursor để tự động hóa / Use Cursor for automation**
   - Cursor có thể nhớ các lệnh bạn thường dùng
   - Có thể tạo shortcuts và aliases

2. **Tích hợp với Git / Integrate with Git**
   - Cursor có thể tự động commit và push sau khi deploy
   - Có thể tạo release notes tự động

3. **Monitoring / Monitoring**
   - Yêu cầu Cursor setup monitoring và alerts
   - Tự động kiểm tra health định kỳ

---

**Lưu ý / Note:** 
- Luôn kiểm tra kỹ trước khi deploy lên production
- Always check carefully before deploying to production
- Sử dụng staging environment để test trước
- Use staging environment to test first





