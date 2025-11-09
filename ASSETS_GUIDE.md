# Hướng dẫn Quản lý Assets (Images, Icons, Files)

## Cấu trúc Thư mục Assets

### 1. `client/public/` - Static Assets

**Mục đích:** Lưu các file tĩnh không cần xử lý bởi Vite, được copy trực tiếp vào build output.

**Cấu trúc đề xuất:**
```
client/public/
├── favicon.ico                    # Icon trình duyệt
├── logo.png                       # Logo chính
├── manifest.json                  # PWA manifest (nếu có)
├── robots.txt                     # SEO
│
├── images/
│   ├── backgrounds/               # Background images
│   │   ├── login-bg.jpg
│   │   ├── dashboard-bg.png
│   │   └── hero-pattern.svg
│   │
│   ├── logos/                     # Company/System logos
│   │   ├── company-logo.png
│   │   ├── logo-dark.svg
│   │   └── logo-light.svg
│   │
│   ├── icons/                     # Large icons/illustrations
│   │   ├── 404-illustration.svg
│   │   ├── empty-state.svg
│   │   └── success-animation.gif
│   │
│   └── screenshots/               # App screenshots (cho documentation)
│       └── dashboard-preview.png
│
└── fonts/                         # Custom web fonts (nếu không dùng Google Fonts)
    └── CustomFont.woff2
```

**Cách sử dụng:**
```tsx
// Truy cập với đường dẫn tuyệt đối từ root public
<img src="/logo.png" alt="Logo" />
<img src="/images/backgrounds/login-bg.jpg" alt="Login Background" />

// Trong CSS
.hero {
  background-image: url('/images/backgrounds/hero-pattern.svg');
}
```

**Khi nào dùng `public/`:**
- ✅ Favicon, manifest, robots.txt
- ✅ Large images không cần optimize
- ✅ Files cần URL cố định (không hash)
- ✅ Files được reference từ index.html
- ✅ Files external/third-party libraries cần

---

### 2. `client/src/assets/` - Bundled Assets

**Mục đích:** Assets được import vào code, Vite sẽ optimize, minify và hash filename.

**Cấu trúc đề xuất:**
```
client/src/assets/
├── images/
│   ├── logo.svg                   # Logo động trong components
│   ├── avatar-default.png         # Avatar mặc định
│   │
│   ├── status/                    # Status icons
│   │   ├── critical.svg
│   │   ├── down.svg
│   │   ├── major.svg
│   │   ├── minor.svg
│   │   └── clear.svg
│   │
│   ├── systems/                   # System type icons
│   │   ├── database.svg
│   │   ├── server.svg
│   │   ├── network.svg
│   │   └── application.svg
│   │
│   └── illustrations/             # Small illustrations
│       ├── no-alerts.svg
│       └── maintenance.svg
│
├── icons/                         # UI icons (nếu không dùng icon library)
│   ├── menu.svg
│   ├── close.svg
│   ├── search.svg
│   └── notification.svg
│
└── data/                          # JSON data, CSV files
    └── sample-data.json
```

**Cách sử dụng:**
```tsx
// Import vào component
import logo from '@/assets/images/logo.svg';
import criticalIcon from '@/assets/images/status/critical.svg';
import defaultAvatar from '@/assets/images/avatar-default.png';

function SystemCard({ status }) {
  return (
    <div>
      <img src={logo} alt="Logo" />
      <img src={criticalIcon} alt="Critical" />
    </div>
  );
}

// Dynamic import
const statusIcons = {
  critical: () => import('@/assets/images/status/critical.svg'),
  down: () => import('@/assets/images/status/down.svg'),
};
```

**Khi nào dùng `src/assets/`:**
- ✅ Images được import trong components
- ✅ Icons nhỏ cần optimize
- ✅ Assets cần cache busting (hash filename)
- ✅ Assets muốn Vite xử lý (minify, optimize)

---

### 3. `attached_assets/` - Design & Documentation

**Mục đích:** Lưu trữ tài liệu thiết kế, mockups, không deploy lên production.

**Cấu trúc:**
```
attached_assets/
├── design/
│   ├── figma-exports/
│   │   ├── dashboard-mockup.png
│   │   └── mobile-view.png
│   ├── wireframes/
│   └── style-guide.pdf
│
├── documentation/
│   ├── screenshots/
│   └── diagrams/
│       └── architecture-diagram.png
│
└── resources/
    └── icon-sources.sketch
```

---

## Định dạng File Khuyến nghị

### Hình ảnh
| Loại | Format | Khi nào dùng |
|------|--------|--------------|
| **Logos** | SVG | Scales tốt, file size nhỏ |
| **Icons** | SVG | UI icons, status icons |
| **Photos** | JPG | Backgrounds, photos |
| **Illustrations** | SVG hoặc PNG | Tùy độ phức tạp |
| **Transparency** | PNG | Cần background trong suốt |
| **Animations** | GIF hoặc Lottie | Loading, success states |

### Icon Libraries
Dự án đang dùng **Lucide React** (xem package.json), nên ưu tiên dùng:

```tsx
import { AlertCircle, Server, Database, Network } from 'lucide-react';

<AlertCircle className="h-4 w-4 text-red-500" />
<Server className="h-6 w-6" />
```

**Chỉ tạo custom icons khi:**
- Icon không có trong Lucide
- Cần brand-specific icons
- Icons đặc thù của dự án

---

## Tối ưu hóa Images

### 1. Nén hình ảnh trước khi commit

**Tools:**
- Online: [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/)
- CLI: `imagemin`, `sharp`

```bash
# Cài đặt imagemin-cli
npm install -g imagemin-cli imagemin-pngquant imagemin-mozjpeg

# Nén PNG
imagemin client/public/images/*.png --out-dir=client/public/images/ --plugin=pngquant

# Nén JPG
imagemin client/public/images/*.jpg --out-dir=client/public/images/ --plugin=mozjpeg
```

### 2. Responsive Images

Sử dụng `srcset` cho responsive:

```tsx
<img
  src="/images/hero-800.jpg"
  srcSet="
    /images/hero-400.jpg 400w,
    /images/hero-800.jpg 800w,
    /images/hero-1200.jpg 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Hero"
/>
```

### 3. Lazy Loading

```tsx
// Native lazy loading
<img src="/images/large-image.jpg" loading="lazy" alt="Large" />

// React lazy loading với Intersection Observer
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src="/images/large-image.jpg"
  alt="Large"
  effect="blur"
/>
```

---

## Import Aliases

Dự án đã cấu hình aliases trong `vite.config.ts`:

```typescript
"@": path.resolve(__dirname, "client/src"),
"@shared": path.resolve(__dirname, "shared"),
"@assets": path.resolve(__dirname, "attached_assets"),
```

**Sử dụng:**
```tsx
// Thay vì: import logo from '../../assets/images/logo.svg'
import logo from '@/assets/images/logo.svg';

// Thay vì: import { Button } from '../../components/ui/button'
import { Button } from '@/components/ui/button';
```

---

## Best Practices

### ✅ DO
- Dùng SVG cho logos và icons
- Nén tất cả images trước khi commit
- Đặt tên file rõ ràng: `dashboard-hero-bg.jpg` thay vì `img1.jpg`
- Dùng lowercase và dashes: `system-icon.svg` thay vì `SystemIcon.svg`
- Tổ chức theo feature/category trong thư mục con
- Sử dụng icon libraries (Lucide React) khi có thể
- Add alt text cho tất cả images

### ❌ DON'T
- Commit large uncompressed images
- Dùng absolute paths từ filesystem: `C:/Users/...`
- Lưu file temporary/cache trong repo
- Trộn lẫn public và src assets
- Dùng spaces trong tên file
- Upload images > 500KB mà không optimize

---

## Ví dụ Thực tế cho Trực Ca AI

### Status Severity Icons

Tạo các icon cho severity levels trong `client/src/assets/images/status/`:

```
status/
├── down.svg        # Màu đỏ đậm
├── critical.svg    # Màu đỏ
├── major.svg       # Màu cam
├── minor.svg       # Màu vàng
└── clear.svg       # Màu xanh
```

**Component sử dụng:**
```tsx
import downIcon from '@/assets/images/status/down.svg';
import criticalIcon from '@/assets/images/status/critical.svg';

const severityIcons = {
  down: downIcon,
  critical: criticalIcon,
  major: majorIcon,
  minor: minorIcon,
  clear: clearIcon,
};

function AlertBadge({ severity }) {
  return <img src={severityIcons[severity]} alt={severity} />;
}
```

### System Type Icons

```
systems/
├── database.svg
├── web-server.svg
├── api-gateway.svg
├── cache-server.svg
└── monitoring.svg
```

### Background Patterns

```
backgrounds/
├── dashboard-pattern.svg    # Subtle pattern cho dashboard
├── login-bg.jpg            # Background trang login
└── maintenance-bg.png      # Background trang maintenance
```

---

## Migration từ Code Hiện tại

Nếu bạn đang có images trong code, di chuyển như sau:

```bash
# 1. Di chuyển static images
mv old-images/*.png client/public/images/

# 2. Di chuyển component images
mv old-images/icons/*.svg client/src/assets/images/

# 3. Update imports trong code
# Tìm: import icon from './icon.svg'
# Thay: import icon from '@/assets/images/icon.svg'
```

---

## Tích hợp với Tailwind CSS

Để sử dụng images trong Tailwind utility classes, thêm vào `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/images/backgrounds/hero-pattern.svg')",
        'login-bg': "url('/images/backgrounds/login-bg.jpg')",
      },
    },
  },
};
```

Sử dụng:
```tsx
<div className="bg-hero-pattern bg-cover">
  Dashboard content
</div>
```

---

## Checklist khi thêm Assets mới

- [ ] File đã được nén/optimize
- [ ] Đặt tên file rõ ràng, lowercase với dashes
- [ ] Lưu đúng thư mục (public vs src/assets)
- [ ] File size hợp lý (< 200KB cho images)
- [ ] SVG được prefer cho icons và logos
- [ ] Alt text được thêm khi sử dụng
- [ ] Tested trên responsive sizes
- [ ] Không commit design files vào src/public

---

## Tài nguyên

- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [TinyPNG](https://tinypng.com/) - Image compression
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG optimization
- [Lucide Icons](https://lucide.dev/) - Icon library đang dùng
- [Unsplash](https://unsplash.com/) - Free stock photos (nếu cần)
