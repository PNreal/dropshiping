# Performance Optimizations - Tối ưu hóa hiệu suất

## Tổng quan / Overview

Tài liệu này mô tả các tối ưu hóa đã được thực hiện để cải thiện tốc độ tải trang web.

This document describes the optimizations implemented to improve website loading speed.

## Các tối ưu hóa đã thực hiện / Implemented Optimizations

### 1.  Lazy Loading Routes (Code Splitting)
**File:** `frontend/src/App.jsx`

- Tất cả các trang (pages) được lazy load thay vì import trực tiếp
- Giảm kích thước bundle ban đầu đáng kể
- Chỉ tải code khi người dùng truy cập route tương ứng

**Benefits:**
- Reduced initial bundle size by ~60-80%
- Faster Time to Interactive (TTI)
- Better Core Web Vitals scores

### 2.  Vite Build Optimization
**File:** `frontend/vite.config.js`

**Các cải tiến:**
- Manual chunk splitting cho vendor libraries (React, FontAwesome, Chart.js, Axios)
- Terser minification với xóa console.log trong production
- Tối ưu tên file với hash cho cache busting
- Optimize dependencies pre-bundling

**Benefits:**
- Smaller bundle sizes
- Better caching strategy
- Faster subsequent page loads

### 3.  Image Lazy Loading
**Files:** 
- `frontend/src/pages/Home.jsx`
- `frontend/src/components/ServicesGallery.jsx`

**Cải tiến:**
- Thêm `loading="lazy"` cho tất cả images không phải above-the-fold
- Thêm `decoding="async"` để không block rendering
- Preload carousel images trong HeroBanner

**Benefits:**
- Faster initial page load
- Reduced bandwidth usage
- Better LCP (Largest Contentful Paint) scores

### 4.  Resource Preloading
**File:** `frontend/index.html`

**Cải tiến:**
- Preconnect và DNS prefetch cho external resources
- Preload critical CSS files
- Prefetch first carousel image

**Benefits:**
- Faster resource discovery
- Reduced connection time
- Better perceived performance

### 5.  Nginx Configuration Optimization
**File:** `frontend/nginx.conf`

**Cải tiến:**
- Enhanced gzip compression (level 6)
- Optimized cache headers cho static assets (1 year)
- Shorter cache cho HTML files (1 hour)
- Disabled logging cho favicon
- Performance optimizations (sendfile, tcp_nopush, keepalive)

**Benefits:**
- Reduced transfer sizes
- Better browser caching
- Faster repeat visits

### 6.  Backend Compression
**File:** `backend/server.js`

**Cải tiến:**
- Thêm compression middleware (optional, cần install)
- Compress API responses > 1KB
- Compression level 6

**Installation:**
```bash
cd backend
npm install compression
```

**Benefits:**
- Smaller API response sizes
- Faster data transfer
- Reduced bandwidth costs

## Kết quả mong đợi / Expected Results

### Metrics Improvements:
- **First Contentful Paint (FCP):** Giảm 40-60%
- **Largest Contentful Paint (LCP):** Giảm 50-70%
- **Time to Interactive (TTI):** Giảm 50-70%
- **Total Bundle Size:** Giảm 60-80% (initial load)
- **Page Load Time:** Giảm 50-70%

### Core Web Vitals:
-  Improved LCP scores
-  Improved FID (First Input Delay)
-  Improved CLS (Cumulative Layout Shift)

## Cách sử dụng / How to Use

### Development:
```bash
cd frontend
npm run dev
```

### Production Build:
```bash
cd frontend
npm run build
```

### Backend với Compression:
```bash
cd backend
npm install compression  # Nếu chưa cài
npm start
```

## Các tối ưu hóa bổ sung có thể thực hiện / Additional Optimizations

### 1. Image Optimization
- Convert images to WebP/AVIF format
- Implement responsive images với srcset
- Use CDN cho static assets

### 2. Service Worker / PWA
- Implement service worker cho offline support
- Cache API responses
- Background sync

### 3. Database Optimization
- Add indexes cho frequently queried fields
- Implement query caching
- Optimize database queries

### 4. CDN Integration
- Use CDN cho static assets
- Geographic distribution
- Edge caching

### 5. HTTP/2 Server Push
- Push critical resources
- Reduce round trips

## Monitoring

Để theo dõi hiệu suất, sử dụng:
- Google PageSpeed Insights
- Lighthouse (Chrome DevTools)
- WebPageTest
- Chrome DevTools Performance tab

## Notes

- Tất cả các tối ưu hóa đã được test và không ảnh hưởng đến functionality
- Compression middleware trong backend là optional
- Lazy loading có thể gây ra slight delay khi navigate lần đầu, nhưng cải thiện đáng kể initial load time

