# Public Images

Thư mục này chứa static assets được copy trực tiếp vào build output.

## Cấu trúc

```
images/
├── backgrounds/    # Background images cho login, dashboard
├── icons/         # Large icons, illustrations
└── logos/         # Company logos, brand assets
```

## Cách sử dụng

```tsx
// Truy cập với đường dẫn tuyệt đối từ root
<img src="/images/logos/company-logo.png" alt="Logo" />
<img src="/images/backgrounds/hero-bg.jpg" alt="Background" />
```

## Lưu ý

- ✅ Nén images trước khi commit
- ✅ SVG cho logos và icons
- ✅ JPG cho photos/backgrounds
- ✅ PNG khi cần transparency
- ❌ Không upload file > 500KB

Xem chi tiết: [ASSETS_GUIDE.md](../../../ASSETS_GUIDE.md)
