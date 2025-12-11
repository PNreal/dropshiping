# Contributing to DHL Shipping

Cảm ơn bạn đã quan tâm đến việc đóng góp cho DHL Shipping! 

## Quy trình đóng góp

### 1. Fork và Clone
```bash
# Fork repository trên GitHub
# Sau đó clone về máy
git clone https://github.com/your-username/DHLSHIPPING.git
cd DHLSHIPPING
```

### 2. Tạo Branch mới
```bash
git checkout -b feature/your-feature-name
# hoặc
git checkout -b fix/your-bug-fix
```

### 3. Cài đặt Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Phát triển tính năng
- Viết code rõ ràng và có comment
- Tuân thủ coding style hiện tại
- Viết tests nếu có thể
- Đảm bảo không có lỗi lint

### 5. Commit Changes
```bash
git add .
git commit -m "feat: Add new feature"
# hoặc
git commit -m "fix: Fix bug in tracking"
```

**Commit message format:**
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Formatting, thiếu semicolon, etc
- `refactor:` - Refactoring code
- `test:` - Thêm tests
- `chore:` - Cập nhật build tasks, package manager configs, etc

### 6. Push và tạo Pull Request
```bash
git push origin feature/your-feature-name
```

Sau đó tạo Pull Request trên GitHub với mô tả rõ ràng về những thay đổi.

## Coding Standards

### JavaScript/React
- Sử dụng ES6+ syntax
- Sử dụng functional components với hooks
- Đặt tên components theo PascalCase
- Đặt tên files theo PascalCase cho components
- Sử dụng camelCase cho variables và functions

### CSS
- Sử dụng BEM naming convention khi có thể
- Tổ chức CSS theo component
- Sử dụng CSS variables cho colors và spacing

### Git
- Commit thường xuyên với messages rõ ràng
- Không commit node_modules hoặc build files
- Tạo branch riêng cho mỗi feature/fix

## Testing

Trước khi submit PR, đảm bảo:
- [ ] Code không có lỗi lint
- [ ] Backend API hoạt động đúng
- [ ] Frontend hiển thị đúng
- [ ] Responsive trên mobile
- [ ] Không có console errors

## Questions?

Nếu có câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ maintainers.

Cảm ơn bạn đã đóng góp! 

