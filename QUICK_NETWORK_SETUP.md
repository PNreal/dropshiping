# Quick Network Setup - Thiết lập nhanh mạng

## Cách nhanh nhất / Quickest Way

### Windows:

1. **Mở Firewall (chạy với quyền Admin):**
   ```powershell
   # Right-click -> Run with PowerShell (as Administrator)
   .\open-firewall.ps1
   ```

2. **Khởi động servers:**
   ```bash
   # Double-click file này hoặc chạy:
   start-network.bat
   ```

3. **Lấy IP address:**
   - Xem trong console window của Backend
   - Hoặc chạy: `ipconfig` và tìm "IPv4 Address"

4. **Truy cập từ thiết bị khác:**
   - Frontend: `http://[YOUR_IP]:5173`
   - Backend: `http://[YOUR_IP]:5000`

### Mac/Linux:

1. **Mở Firewall:**
   ```bash
   sudo ufw allow 5173/tcp
   sudo ufw allow 5000/tcp
   ```

2. **Khởi động servers:**
   ```bash
   chmod +x start-network.sh
   ./start-network.sh
   ```

3. **Lấy IP address:**
   ```bash
   ifconfig | grep "inet "
   # Hoặc
   ip addr show
   ```

## Checklist

- [ ] Firewall đã mở port 5173 và 5000
- [ ] Backend server đang chạy
- [ ] Frontend server đang chạy
- [ ] Đã lấy được IP address
- [ ] Thiết bị khác cùng mạng WiFi/LAN
- [ ] Test truy cập từ thiết bị khác

## Kiểm tra nhanh / Quick Check

**Từ máy chạy server:**
```bash
# Test backend
curl http://localhost:5000/health

# Test frontend
curl http://localhost:5173
```

**Từ thiết bị khác (thay YOUR_IP):**
```bash
# Test backend
curl http://YOUR_IP:5000/health

# Mở browser
http://YOUR_IP:5173
```

## Vấn đề thường gặp / Common Issues

### Không thể truy cập?

1. **Kiểm tra firewall:**
   - Windows: Chạy `open-firewall.ps1` với quyền Admin
   - Mac: System Preferences → Security → Firewall

2. **Kiểm tra IP:**
   - Đảm bảo dùng đúng IP của máy server
   - Không dùng `localhost` từ thiết bị khác

3. **Kiểm tra cùng mạng:**
   - Cả hai thiết bị phải cùng WiFi/LAN
   - Không thể qua internet (trừ khi dùng ngrok)

### Muốn truy cập từ Internet?

Xem hướng dẫn chi tiết trong `NETWORK_ACCESS.md` - phần Ngrok.

## Tài liệu đầy đủ / Full Documentation

- `NETWORK_ACCESS.md` - Hướng dẫn chi tiết
- `START_SERVERS.md` - Hướng dẫn chạy servers

