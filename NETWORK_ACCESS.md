# Hướng dẫn truy cập từ mạng / Network Access Guide

## Cấu hình đã thực hiện / Configuration Applied

### Frontend (Vite Dev Server)
-  Đã cấu hình để listen trên `0.0.0.0` (tất cả network interfaces)
-  Port mặc định: `5173`
-  Có thể truy cập từ mạng nội bộ

### Backend (Express Server)
-  Đã cấu hình để listen trên `0.0.0.0`
-  Port mặc định: `5000`
-  Hiển thị IP address khi khởi động

## Cách sử dụng / How to Use

### 1. Khởi động servers / Start Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Tìm địa chỉ IP của bạn / Find Your IP Address

Khi khởi động backend, server sẽ tự động hiển thị:
- Local IP (localhost)
- Network IP (để người khác truy cập)

**Hoặc tìm IP thủ công / Or find IP manually:**

**Windows:**
```bash
ipconfig
# Tìm "IPv4 Address" trong kết quả
```

**Mac/Linux:**
```bash
ifconfig
# Hoặc
ip addr show
# Tìm địa chỉ IP của bạn (thường bắt đầu bằng 192.168.x.x hoặc 10.x.x.x)
```

### 3. Truy cập từ thiết bị khác / Access from Other Devices

**Từ mạng nội bộ (cùng WiFi/LAN):**
- Mở browser và truy cập: `http://[YOUR_IP]:5173`
- Ví dụ: `http://192.168.1.100:5173`

**Lưu ý / Notes:**
-  Cả frontend và backend đều phải đang chạy
-  Thiết bị khác phải cùng mạng WiFi/LAN
-  Firewall có thể chặn - cần mở port 5173 và 5000

## Mở Firewall / Open Firewall

### Windows Firewall

**Cách 1: Qua Settings**
1. Mở Windows Security → Firewall & network protection
2. Advanced settings
3. Inbound Rules → New Rule
4. Port → TCP → Specific local ports: `5173,5000`
5. Allow the connection
6. Apply to all profiles

**Cách 2: Qua PowerShell (Run as Administrator)**
```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### Mac Firewall
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add application hoặc allow incoming connections

### Linux (UFW)
```bash
sudo ufw allow 5173/tcp
sudo ufw allow 5000/tcp
```

## Truy cập từ Internet (Ngrok) / Internet Access

Nếu muốn người khác truy cập từ internet (không cùng mạng), sử dụng **ngrok**:

### Cài đặt Ngrok
```bash
# Download từ https://ngrok.com/download
# Hoặc với npm:
npm install -g ngrok
```

### Chạy Ngrok cho Frontend
```bash
ngrok http 5173
```

### Chạy Ngrok cho Backend
```bash
ngrok http 5000
```

**Lưu ý:**
- Ngrok free plan có giới hạn
- URL sẽ thay đổi mỗi lần restart
- Có thể cần cấu hình lại proxy trong Vite config

### Cấu hình Vite với Ngrok Backend

Nếu dùng ngrok cho backend, cập nhật `frontend/vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-ngrok-url.ngrok.io', // Thay bằng ngrok URL của bạn
      changeOrigin: true,
      secure: true,
    },
    '/uploads': {
      target: 'https://your-ngrok-url.ngrok.io',
      changeOrigin: true,
      secure: true,
    }
  }
}
```

## Troubleshooting / Xử lý sự cố

### Không thể truy cập từ thiết bị khác

1. **Kiểm tra Firewall:**
   - Đảm bảo port 5173 và 5000 đã được mở
   - Tạm thời tắt firewall để test

2. **Kiểm tra IP Address:**
   - Đảm bảo đang dùng đúng IP address
   - IP phải là của máy chạy server, không phải của thiết bị client

3. **Kiểm tra cùng mạng:**
   - Cả hai thiết bị phải cùng WiFi/LAN
   - Không thể truy cập qua internet nếu không dùng ngrok

4. **Kiểm tra server đang chạy:**
   ```bash
   # Kiểm tra port đang được sử dụng
   # Windows:
   netstat -ano | findstr :5173
   netstat -ano | findstr :5000
   
   # Mac/Linux:
   lsof -i :5173
   lsof -i :5000
   ```

5. **Kiểm tra CORS:**
   - Backend đã có `cors()` middleware, nên không cần lo lắng

### Lỗi "Connection refused"

- Đảm bảo server đang chạy
- Kiểm tra firewall
- Kiểm tra IP address đúng

### Lỗi "Network request failed"

- Kiểm tra backend có đang chạy không
- Kiểm tra proxy configuration trong Vite
- Nếu dùng ngrok, đảm bảo URL đúng

## Bảo mật / Security

 **Lưu ý quan trọng:**

1. **Development Mode:**
   - Chỉ dùng cho development/testing
   - Không nên expose ra internet trong production

2. **Production:**
   - Sử dụng reverse proxy (nginx)
   - SSL/HTTPS
   - Authentication
   - Rate limiting

3. **Ngrok:**
   - URL ngrok có thể bị lộ
   - Không nên share URL công khai
   - Cân nhắc dùng ngrok với authentication

## Quick Start Script

Tạo file `start-network.bat` (Windows) hoặc `start-network.sh` (Mac/Linux):

**Windows (start-network.bat):**
```batch
@echo off
echo Starting Backend...
start cmd /k "cd backend && npm start"
timeout /t 3
echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"
echo.
echo Servers are starting...
echo Check the console windows for IP addresses
pause
```

**Mac/Linux (start-network.sh):**
```bash
#!/bin/bash
echo "Starting Backend..."
cd backend && npm start &
sleep 3
echo "Starting Frontend..."
cd ../frontend && npm run dev &
echo ""
echo "Servers are starting..."
echo "Check the console for IP addresses"
```

