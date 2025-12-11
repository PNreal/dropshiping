# Hướng dẫn Setup Repository

## Khởi tạo Git Repository

Repository đã được khởi tạo với Git. Để bắt đầu làm việc:

### 1. Kiểm tra trạng thái
```bash
git status
```

### 2. Thêm remote repository (nếu có)
```bash
git remote add origin <your-repository-url>
```

### 3. Commit lần đầu
```bash
git add .
git commit -m "Initial commit: DHL Shipping application"
```

### 4. Push lên remote
```bash
git branch -M main
git push -u origin main
```

## Cấu trúc Repository

```
DHLSHIPPING/
 .git/                    # Git repository
 .gitignore              # Git ignore rules
 .gitattributes          # Git attributes (line endings)
 README.md               # Tài liệu chính
 LICENSE                 # License file
 CONTRIBUTING.md         # Hướng dẫn đóng góp
 SETUP.md                # File này
 PROJECT_STATUS.md       # Trạng thái dự án
 START_SERVERS.md        # Hướng dẫn chạy servers

 backend/                # Backend API
    database/
    routes/
    scripts/
    ...

 frontend/                # Frontend React App
     src/
     public/
     ...
```

## Files được Gitignore

Các file/folder sau sẽ không được commit:
- `node_modules/` - Dependencies
- `*.sqlite` - Database files
- `.env` - Environment variables
- `dist/`, `build/` - Build outputs
- Logs và temporary files
- IDE config files

## Best Practices

### 1. Branch Strategy
- `main` - Production ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### 2. Commit Messages
Sử dụng format:
```
type: description

feat: Add tracking page
fix: Fix API error handling
docs: Update README
```

### 3. Before Committing
- [ ] Chạy linter: `npm run lint` (frontend)
- [ ] Test API endpoints
- [ ] Kiểm tra không có console errors
- [ ] Đảm bảo responsive trên mobile

## Environment Setup

### Backend
Tạo file `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./database/database.sqlite
```

### Frontend
Không cần file .env cho development (proxy đã được config trong vite.config.js)

## Database

Database file (`database.sqlite`) được gitignore vì:
- Chứa dữ liệu local
- Có thể tái tạo bằng `npm run init-data`

Để khởi tạo database mới:
```bash
cd backend
npm run init-data
```

## Deployment Checklist

Trước khi deploy:
- [ ] Update version trong package.json
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test production build locally
- [ ] Update environment variables
- [ ] Backup database (nếu cần)
- [ ] Update documentation

## Troubleshooting

### Git line ending warnings
Đã được xử lý bằng `.gitattributes`. Nếu vẫn thấy warnings, chạy:
```bash
git config core.autocrlf true
```

### Database conflicts
Nếu có conflict với database.sqlite:
```bash
# Xóa và tạo lại
rm backend/database/database.sqlite
cd backend
npm run init-data
```

## Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra README.md
2. Kiểm tra CONTRIBUTING.md
3. Tạo issue trên GitHub

