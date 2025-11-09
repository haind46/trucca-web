# Source Assets

Thư mục này chứa assets được import vào components, sẽ được Vite optimize và hash.

## Cấu trúc

```
assets/
├── images/
│   ├── status/      # Icons cho severity levels (critical, down, major, minor, clear)
│   └── systems/     # Icons cho system types (database, server, network, etc.)
└── icons/          # Custom UI icons (nếu không có trong Lucide)
```

## Cách sử dụng

```tsx
// Import vào component
import criticalIcon from '@/assets/images/status/critical.svg';
import serverIcon from '@/assets/images/systems/server.svg';

function SystemCard() {
  return <img src={criticalIcon} alt="Critical" />;
}
```

## Alias Path

Dự án đã cấu hình alias `@` trỏ đến `client/src`:

```tsx
import icon from '@/assets/images/icon.svg';  // ✅ Tốt
import icon from '../../assets/images/icon.svg';  // ❌ Tránh
```

## Icon Library

Dự án sử dụng **Lucide React**. Ưu tiên dùng icons từ library:

```tsx
import { AlertCircle, Server, Database } from 'lucide-react';

<AlertCircle className="h-4 w-4 text-red-500" />
```

Chỉ tạo custom icons khi không có sẵn trong Lucide.

Xem chi tiết: [ASSETS_GUIDE.md](../../ASSETS_GUIDE.md)
