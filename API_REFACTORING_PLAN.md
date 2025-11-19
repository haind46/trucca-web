# API Refactoring Plan - Centralize API Endpoints

## 📋 Tổng quan

Hiện tại project có **20 files** gọi API với nhiều pattern khác nhau và hardcoded URLs. Cần refactor để:
1. ✅ Tập trung tất cả API endpoints vào 1 file duy nhất
2. ✅ Dễ dàng thay đổi base URL (host + port) khi deploy
3. ✅ Tránh hardcode `http://localhost:8002` trong code
4. ✅ Đồng nhất cách gọi API trong toàn bộ project

---

## 🎯 Mục tiêu

### Trước khi refactor:
```typescript
// ❌ Hardcode trực tiếp trong component
const response = await fetchWithAuth('http://localhost:8002/api/users');

// ❌ Hardcode trong useQuery
const { data } = useQuery({
  queryKey: ['http://localhost:8002/api/sys-groups'],
  queryFn: async () => {
    const res = await fetchWithAuth('http://localhost:8002/api/sys-groups');
    return res.json();
  }
});
```

### Sau khi refactor:
```typescript
// ✅ Sử dụng API_ENDPOINTS từ file centralized
import { API_ENDPOINTS } from '@/lib/api-endpoints';

const response = await fetchWithAuth(API_ENDPOINTS.USERS.LIST);

// ✅ Clean và dễ maintain
const { data } = useQuery({
  queryKey: [API_ENDPOINTS.SYS_GROUPS.LIST],
  queryFn: async () => {
    const res = await fetchWithAuth(API_ENDPOINTS.SYS_GROUPS.LIST);
    return res.json();
  }
});
```

---

## 📊 Phân tích hiện trạng

### 1. Files cần sửa (theo mức độ ưu tiên)

#### 🔴 **Mức độ cao** - Có hardcoded `http://localhost:8002` (10 files)

| File | Số API calls | Endpoints |
|------|--------------|-----------|
| [UserManagement.tsx](client/src/pages/UserManagement.tsx) | 9+ | users, sys-groups |
| [ConfigRoles.tsx](client/src/pages/ConfigRoles.tsx) | 9+ | roles |
| [UserGroupManagement.tsx](client/src/pages/UserGroupManagement.tsx) | 8+ | sys-groups |
| [PermissionManagement.tsx](client/src/pages/PermissionManagement.tsx) | 10+ | resources, permissions, sys-groups |
| [ConfigAlertFrequency.tsx](client/src/pages/ConfigAlertFrequency.tsx) | 7 | alert_frequency |
| [ConfigSystemLevel.tsx](client/src/pages/ConfigSystemLevel.tsx) | 7 | systemLevel |
| [ConfigOperationTypes.tsx](client/src/pages/ConfigOperationTypes.tsx) | 7 | operation-type |
| [departmentService.ts](client/src/services/departmentService.ts) | 7 | department |
| [GroupUsersTab.tsx](client/src/components/GroupUsersTab.tsx) | 1 | user-groups |
| [UserGroupsDialog.tsx](client/src/components/UserGroupsDialog.tsx) | 3 | sys-groups, users |

#### 🟡 **Mức độ trung bình** - Dùng relative path `/api/...` (10 files)

| File | Pattern | Endpoints |
|------|---------|-----------|
| [Dashboard.tsx](client/src/pages/Dashboard.tsx) | useQuery | stats, systems, alerts |
| [Alerts.tsx](client/src/pages/Alerts.tsx) | useQuery | alerts, systems |
| [ConfigSystems.tsx](client/src/pages/ConfigSystems.tsx) | useQuery | systems |
| [ConfigContacts.tsx](client/src/pages/ConfigContacts.tsx) | useQuery | contacts |
| [ConfigGroups.tsx](client/src/pages/ConfigGroups.tsx) | useQuery | groups |
| [ConfigRules.tsx](client/src/pages/ConfigRules.tsx) | useQuery | rules |
| [Reports.tsx](client/src/pages/Reports.tsx) | useQuery | incidents |
| [Schedules.tsx](client/src/pages/Schedules.tsx) | useQuery | schedules, contacts, systems |
| [Login.tsx](client/src/pages/Login.tsx) | fetch | auth/login |
| [auth-context.tsx](client/src/lib/auth-context.tsx) | fetch | auth/logout |

---

## 🏗️ Kiến trúc mới

### File structure:
```
client/src/lib/
├── api-config.ts          # NEW - Base URL configuration
├── api-endpoints.ts       # NEW - All endpoint definitions
├── api.ts                 # EXISTING - fetchWithAuth utility
└── queryClient.ts         # EXISTING - React Query setup
```

### 1. **api-config.ts** - Cấu hình base URL

```typescript
/**
 * API Configuration
 * Centralized configuration for API base URL
 */

// Lấy config từ environment variables hoặc meta tags
const getMetaContent = (name: string): string | null => {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta?.getAttribute('content') || null;
};

// Get backend URL from environment or meta tag
const backendUrl = getMetaContent('vite-backend-url') ||
                   import.meta.env.VITE_BACKEND_URL ||
                   '';

// Determine if using direct connection or nginx proxy
const isDevelopment = backendUrl && (
  backendUrl.includes('localhost') ||
  backendUrl.includes('127.0.0.1')
);

// Export API base URL
export const API_BASE_URL = isDevelopment ? backendUrl : '';

// Export API base path
export const API_BASE = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

// Log configuration (useful for debugging)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  Base URL:', API_BASE_URL || '(empty - using nginx proxy)');
  console.log('  API Base:', API_BASE);
  console.log('  Mode:', isDevelopment ? 'Direct connection' : 'Nginx proxy');
}
```

### 2. **api-endpoints.ts** - Tất cả endpoint definitions

```typescript
/**
 * API Endpoints
 * Centralized API endpoint definitions for the entire application
 *
 * Usage:
 *   import { API_ENDPOINTS } from '@/lib/api-endpoints';
 *   fetchWithAuth(API_ENDPOINTS.USERS.LIST);
 *   fetchWithAuth(API_ENDPOINTS.USERS.DETAIL(123));
 */

import { API_BASE } from './api-config';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    ME: `${API_BASE}/auth/me`,
  },

  // Systems (existing)
  SYSTEMS: {
    LIST: `${API_BASE}/systems`,
    DETAIL: (id: number | string) => `${API_BASE}/systems/${id}`,
    CREATE: `${API_BASE}/systems`,
    UPDATE: (id: number | string) => `${API_BASE}/systems/${id}`,
    DELETE: (id: number | string) => `${API_BASE}/systems/${id}`,
  },

  // Alerts (existing)
  ALERTS: {
    LIST: `${API_BASE}/alerts`,
    ACTIVE: `${API_BASE}/alerts/active`,
    DETAIL: (id: number | string) => `${API_BASE}/alerts/${id}`,
    ACKNOWLEDGE: (id: number | string) => `${API_BASE}/alerts/${id}/acknowledge`,
  },

  // Contacts (existing)
  CONTACTS: {
    LIST: `${API_BASE}/contacts`,
    DETAIL: (id: number | string) => `${API_BASE}/contacts/${id}`,
    CREATE: `${API_BASE}/contacts`,
    DELETE: (id: number | string) => `${API_BASE}/contacts/${id}`,
  },

  // Groups (existing)
  GROUPS: {
    LIST: `${API_BASE}/groups`,
    DETAIL: (id: number | string) => `${API_BASE}/groups/${id}`,
    CREATE: `${API_BASE}/groups`,
    DELETE: (id: number | string) => `${API_BASE}/groups/${id}`,
  },

  // Rules (existing)
  RULES: {
    LIST: `${API_BASE}/rules`,
    DETAIL: (id: number | string) => `${API_BASE}/rules/${id}`,
    CREATE: `${API_BASE}/rules`,
    DELETE: (id: number | string) => `${API_BASE}/rules/${id}`,
  },

  // Schedules (existing)
  SCHEDULES: {
    LIST: `${API_BASE}/schedules`,
    DETAIL: (id: number | string) => `${API_BASE}/schedules/${id}`,
    CREATE: `${API_BASE}/schedules`,
    DELETE: (id: number | string) => `${API_BASE}/schedules/${id}`,
  },

  // Incidents (existing)
  INCIDENTS: {
    LIST: `${API_BASE}/incidents`,
    DETAIL: (id: number | string) => `${API_BASE}/incidents/${id}`,
  },

  // Stats (existing)
  STATS: {
    OVERVIEW: `${API_BASE}/stats`,
  },

  // Users (NEW - from hardcoded)
  USERS: {
    LIST: `${API_BASE}/users`,
    DETAIL: (id: number | string) => `${API_BASE}/users/${id}`,
    CREATE: `${API_BASE}/users/create`,
    UPDATE: `${API_BASE}/users/edit`,
    DELETE: `${API_BASE}/users/delete`,
    EXPORT: `${API_BASE}/users/export`,
    IMPORT: `${API_BASE}/users/import`,
    IMPORT_TEMPLATE: `${API_BASE}/users/import-template`,
    COPY: `${API_BASE}/users/copy`,
    GROUPS: (id: number | string) => `${API_BASE}/users/${id}/groups`,
  },

  // System Groups (NEW - from hardcoded)
  SYS_GROUPS: {
    LIST: `${API_BASE}/sys-groups`,
    DETAIL: (id: number | string) => `${API_BASE}/sys-groups/${id}`,
    CREATE: `${API_BASE}/sys-groups/create`,
    UPDATE: `${API_BASE}/sys-groups/update`,
    DELETE: `${API_BASE}/sys-groups/delete`,
    COPY: `${API_BASE}/sys-groups/copy`,
    IMPORT: `${API_BASE}/sys-groups/import`,
    EXPORT: `${API_BASE}/sys-groups/export`,
    IMPORT_TEMPLATE: `${API_BASE}/sys-groups/import-template`,
  },

  // Roles (NEW - from hardcoded)
  ROLES: {
    LIST: `${API_BASE}/roles`,
    DETAIL: (id: number | string) => `${API_BASE}/roles/${id}`,
    CREATE: `${API_BASE}/roles/create`,
    UPDATE: `${API_BASE}/roles/edit`,
    DELETE: `${API_BASE}/roles/delete`,
    EXPORT: `${API_BASE}/roles/export`,
    IMPORT: `${API_BASE}/roles/import`,
    TEMPLATE: `${API_BASE}/roles/template`,
  },

  // Resources/Permissions (NEW - from hardcoded)
  RESOURCES: {
    LIST: `${API_BASE}/resources`,
    DETAIL: (id: number | string) => `${API_BASE}/resources/${id}`,
    CREATE: `${API_BASE}/resources/create`,
    UPDATE: `${API_BASE}/resources/update`,
    DELETE: `${API_BASE}/resources/delete`,
    COPY: `${API_BASE}/resources/copy`,
    IMPORT: `${API_BASE}/resources/import`,
    EXPORT: `${API_BASE}/resources/export`,
    IMPORT_TEMPLATE: `${API_BASE}/resources/import-template`,
  },

  // Permissions (NEW - from hardcoded)
  PERMISSIONS: {
    RESOURCES: `${API_BASE}/permissions/resources`,
    GROUPS: `${API_BASE}/permissions/groups`,
  },

  // Alert Frequency (NEW - from hardcoded)
  ALERT_FREQUENCY: {
    LIST: `${API_BASE}/alert_frequency`,
    DETAIL: (id: number | string) => `${API_BASE}/alert_frequency/${id}`,
    CREATE: `${API_BASE}/alert_frequency/create`,
    UPDATE: `${API_BASE}/alert_frequency/edit`,
    DELETE: `${API_BASE}/alert_frequency/delete`,
    IMPORT: `${API_BASE}/alert_frequency/import`,
    EXPORT: `${API_BASE}/alert_frequency/export`,
    TEMPLATE: `${API_BASE}/alert_frequency/template`,
  },

  // System Level (NEW - from hardcoded)
  SYSTEM_LEVEL: {
    LIST: `${API_BASE}/systemLevel`,
    DETAIL: (id: number | string) => `${API_BASE}/systemLevel/${id}`,
    CREATE: `${API_BASE}/systemLevel/create`,
    UPDATE: `${API_BASE}/systemLevel/edit`,
    DELETE: `${API_BASE}/systemLevel/delete`,
    IMPORT: `${API_BASE}/systemLevel/import`,
    EXPORT: `${API_BASE}/systemLevel/export`,
    TEMPLATE: `${API_BASE}/systemLevel/template`,
  },

  // Operation Types (NEW - from hardcoded)
  OPERATION_TYPES: {
    LIST: `${API_BASE}/operation-type`,
    DETAIL: (id: number | string) => `${API_BASE}/operation-type/${id}`,
    CREATE: `${API_BASE}/operation-type/create`,
    UPDATE: `${API_BASE}/operation-type/edit`,
    DELETE: `${API_BASE}/operation-type/delete`,
    COPY: `${API_BASE}/operation-type/copy`,
    EXPORT: `${API_BASE}/operation-type/export`,
    TEMPLATE: `${API_BASE}/operation-type/template`,
  },

  // Departments (NEW - from hardcoded)
  DEPARTMENTS: {
    LIST: `${API_BASE}/department`,
    DETAIL: (id: number | string) => `${API_BASE}/department/${id}`,
    CREATE: `${API_BASE}/department/create`,
    UPDATE: `${API_BASE}/department/edit`,
    DELETE: `${API_BASE}/department/delete`,
    EXPORT: `${API_BASE}/department/export`,
    IMPORT: `${API_BASE}/department/import`,
    IMPORT_TEMPLATE: `${API_BASE}/department/import-template`,
  },

  // User Groups (NEW - from hardcoded)
  USER_GROUPS: {
    BY_GROUP: (groupId: number | string) => `${API_BASE}/user-groups/group/${groupId}`,
  },
} as const;

// Helper function to build query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Helper function to get full URL with query params
export function getApiUrl(endpoint: string, params?: Record<string, any>): string {
  if (params) {
    return `${endpoint}${buildQueryString(params)}`;
  }
  return endpoint;
}

// Export config for other uses
export { API_BASE_URL, API_BASE } from './api-config';
```

---

## 🔧 Refactoring Strategy

### Bước 1: Tạo files mới (DONE khi approved)
- ✅ Tạo `client/src/lib/api-config.ts`
- ✅ Tạo `client/src/lib/api-endpoints.ts` (hoặc update file hiện có nếu có)

### Bước 2: Update files có hardcoded URL (10 files - Priority 🔴)

#### Ví dụ cụ thể cho `UserManagement.tsx`:

**Before:**
```typescript
// ❌ Hardcoded URL
const response = await fetchWithAuth(
  `http://localhost:8002/api/users?page=${page}&size=${pageSize}`
);

const createResponse = await fetchWithAuth(
  `http://localhost:8002/api/users/create`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  }
);
```

**After:**
```typescript
// ✅ Use centralized endpoints
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';

const response = await fetchWithAuth(
  getApiUrl(API_ENDPOINTS.USERS.LIST, { page, size: pageSize })
);

const createResponse = await fetchWithAuth(
  API_ENDPOINTS.USERS.CREATE,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  }
);
```

**Changes per file:**
1. Import `API_ENDPOINTS` và `getApiUrl` from `@/lib/api-endpoints`
2. Replace tất cả `http://localhost:8002/api/...` → `API_ENDPOINTS...`
3. Sử dụng `getApiUrl()` cho URLs có query parameters

### Bước 3: Update files dùng relative path (10 files - Priority 🟡)

#### Ví dụ cho `Dashboard.tsx`:

**Before:**
```typescript
// ❌ Hardcoded relative path
const { data: stats } = useQuery<Stats>({
  queryKey: ["/api/stats"],
});

const { data: systems } = useQuery<SystemWithAlertCount[]>({
  queryKey: ["/api/systems"],
});
```

**After:**
```typescript
// ✅ Use centralized endpoints
import { API_ENDPOINTS } from '@/lib/api-endpoints';

const { data: stats } = useQuery<Stats>({
  queryKey: [API_ENDPOINTS.STATS.OVERVIEW],
});

const { data: systems } = useQuery<SystemWithAlertCount[]>({
  queryKey: [API_ENDPOINTS.SYSTEMS.LIST],
});
```

**Changes per file:**
1. Import `API_ENDPOINTS` from `@/lib/api-endpoints`
2. Replace tất cả `"/api/..."` → `API_ENDPOINTS...`

### Bước 4: Update service files (1 file)

#### `departmentService.ts`:

**Before:**
```typescript
// ❌ Hardcoded
const response = await fetchWithAuth('http://localhost:8002/api/department');
```

**After:**
```typescript
// ✅ Use centralized endpoints
import { API_ENDPOINTS } from '@/lib/api-endpoints';

const response = await fetchWithAuth(API_ENDPOINTS.DEPARTMENTS.LIST);
```

---

## 📝 Danh sách chi tiết files cần sửa

### 🔴 Priority High (Hardcoded localhost:8002) - 10 files

1. ✅ `client/src/pages/UserManagement.tsx`
   - Replace: `http://localhost:8002/api/users` → `API_ENDPOINTS.USERS.LIST`
   - Replace: `http://localhost:8002/api/users/create` → `API_ENDPOINTS.USERS.CREATE`
   - Replace: `http://localhost:8002/api/users/edit` → `API_ENDPOINTS.USERS.UPDATE`
   - Replace: `http://localhost:8002/api/users/delete` → `API_ENDPOINTS.USERS.DELETE`
   - Replace: `http://localhost:8002/api/users/export` → `API_ENDPOINTS.USERS.EXPORT`
   - Replace: `http://localhost:8002/api/users/import` → `API_ENDPOINTS.USERS.IMPORT`
   - Replace: `http://localhost:8002/api/users/import-template` → `API_ENDPOINTS.USERS.IMPORT_TEMPLATE`
   - Replace: `http://localhost:8002/api/users/copy` → `API_ENDPOINTS.USERS.COPY`
   - Replace: `http://localhost:8002/api/sys-groups` → `API_ENDPOINTS.SYS_GROUPS.LIST`

2. ✅ `client/src/pages/ConfigRoles.tsx`
   - Replace: `http://localhost:8002/api/roles` → `API_ENDPOINTS.ROLES.LIST`
   - Replace: `http://localhost:8002/api/roles/create` → `API_ENDPOINTS.ROLES.CREATE`
   - Replace: `http://localhost:8002/api/roles/edit` → `API_ENDPOINTS.ROLES.UPDATE`
   - Replace: `http://localhost:8002/api/roles/delete` → `API_ENDPOINTS.ROLES.DELETE`
   - Replace: `http://localhost:8002/api/roles/export` → `API_ENDPOINTS.ROLES.EXPORT`
   - Replace: `http://localhost:8002/api/roles/import` → `API_ENDPOINTS.ROLES.IMPORT`
   - Replace: `http://localhost:8002/api/roles/template` → `API_ENDPOINTS.ROLES.TEMPLATE`

3. ✅ `client/src/pages/UserGroupManagement.tsx`
   - Replace: `http://localhost:8002/api/sys-groups` → `API_ENDPOINTS.SYS_GROUPS.LIST`
   - Replace: `http://localhost:8002/api/sys-groups/create` → `API_ENDPOINTS.SYS_GROUPS.CREATE`
   - Replace: `http://localhost:8002/api/sys-groups/update` → `API_ENDPOINTS.SYS_GROUPS.UPDATE`
   - Replace: `http://localhost:8002/api/sys-groups/delete` → `API_ENDPOINTS.SYS_GROUPS.DELETE`
   - Replace: `http://localhost:8002/api/sys-groups/copy` → `API_ENDPOINTS.SYS_GROUPS.COPY`
   - Replace: `http://localhost:8002/api/sys-groups/import` → `API_ENDPOINTS.SYS_GROUPS.IMPORT`
   - Replace: `http://localhost:8002/api/sys-groups/export` → `API_ENDPOINTS.SYS_GROUPS.EXPORT`
   - Replace: `http://localhost:8002/api/sys-groups/import-template` → `API_ENDPOINTS.SYS_GROUPS.IMPORT_TEMPLATE`

4. ✅ `client/src/pages/PermissionManagement.tsx`
   - Replace: `http://localhost:8002/api/resources` → `API_ENDPOINTS.RESOURCES.LIST`
   - Replace: `http://localhost:8002/api/resources/create` → `API_ENDPOINTS.RESOURCES.CREATE`
   - Replace: `http://localhost:8002/api/resources/update` → `API_ENDPOINTS.RESOURCES.UPDATE`
   - Replace: `http://localhost:8002/api/resources/delete` → `API_ENDPOINTS.RESOURCES.DELETE`
   - Replace: `http://localhost:8002/api/resources/copy` → `API_ENDPOINTS.RESOURCES.COPY`
   - Replace: `http://localhost:8002/api/resources/import` → `API_ENDPOINTS.RESOURCES.IMPORT`
   - Replace: `http://localhost:8002/api/resources/export` → `API_ENDPOINTS.RESOURCES.EXPORT`
   - Replace: `http://localhost:8002/api/resources/import-template` → `API_ENDPOINTS.RESOURCES.IMPORT_TEMPLATE`
   - Replace: `http://localhost:8002/api/sys-groups` → `API_ENDPOINTS.SYS_GROUPS.LIST`
   - Replace: `http://localhost:8002/api/permissions/resources` → `API_ENDPOINTS.PERMISSIONS.RESOURCES`
   - Replace: `http://localhost:8002/api/permissions/groups` → `API_ENDPOINTS.PERMISSIONS.GROUPS`

5. ✅ `client/src/pages/ConfigAlertFrequency.tsx`
   - Replace: `http://localhost:8002/api/alert_frequency` → `API_ENDPOINTS.ALERT_FREQUENCY.LIST`
   - Replace: `http://localhost:8002/api/alert_frequency/create` → `API_ENDPOINTS.ALERT_FREQUENCY.CREATE`
   - Replace: `http://localhost:8002/api/alert_frequency/edit` → `API_ENDPOINTS.ALERT_FREQUENCY.UPDATE`
   - Replace: `http://localhost:8002/api/alert_frequency/delete` → `API_ENDPOINTS.ALERT_FREQUENCY.DELETE`
   - Replace: `http://localhost:8002/api/alert_frequency/import` → `API_ENDPOINTS.ALERT_FREQUENCY.IMPORT`
   - Replace: `http://localhost:8002/api/alert_frequency/export` → `API_ENDPOINTS.ALERT_FREQUENCY.EXPORT`
   - Replace: `http://localhost:8002/api/alert_frequency/template` → `API_ENDPOINTS.ALERT_FREQUENCY.TEMPLATE`

6. ✅ `client/src/pages/ConfigSystemLevel.tsx`
   - Replace: `http://localhost:8002/api/systemLevel` → `API_ENDPOINTS.SYSTEM_LEVEL.LIST`
   - Replace: `http://localhost:8002/api/systemLevel/create` → `API_ENDPOINTS.SYSTEM_LEVEL.CREATE`
   - Replace: `http://localhost:8002/api/systemLevel/edit` → `API_ENDPOINTS.SYSTEM_LEVEL.UPDATE`
   - Replace: `http://localhost:8002/api/systemLevel/delete` → `API_ENDPOINTS.SYSTEM_LEVEL.DELETE`
   - Replace: `http://localhost:8002/api/systemLevel/import` → `API_ENDPOINTS.SYSTEM_LEVEL.IMPORT`
   - Replace: `http://localhost:8002/api/systemLevel/export` → `API_ENDPOINTS.SYSTEM_LEVEL.EXPORT`
   - Replace: `http://localhost:8002/api/systemLevel/template` → `API_ENDPOINTS.SYSTEM_LEVEL.TEMPLATE`

7. ✅ `client/src/pages/ConfigOperationTypes.tsx`
   - Replace: `http://localhost:8002/api/operation-type` → `API_ENDPOINTS.OPERATION_TYPES.LIST`
   - Replace: `http://localhost:8002/api/operation-type/create` → `API_ENDPOINTS.OPERATION_TYPES.CREATE`
   - Replace: `http://localhost:8002/api/operation-type/edit` → `API_ENDPOINTS.OPERATION_TYPES.UPDATE`
   - Replace: `http://localhost:8002/api/operation-type/delete` → `API_ENDPOINTS.OPERATION_TYPES.DELETE`
   - Replace: `http://localhost:8002/api/operation-type/copy` → `API_ENDPOINTS.OPERATION_TYPES.COPY`
   - Replace: `http://localhost:8002/api/operation-type/export` → `API_ENDPOINTS.OPERATION_TYPES.EXPORT`
   - Replace: `http://localhost:8002/api/operation-type/template` → `API_ENDPOINTS.OPERATION_TYPES.TEMPLATE`

8. ✅ `client/src/services/departmentService.ts`
   - Replace: `http://localhost:8002/api/department` → `API_ENDPOINTS.DEPARTMENTS.LIST`
   - Replace: `http://localhost:8002/api/department/create` → `API_ENDPOINTS.DEPARTMENTS.CREATE`
   - Replace: `http://localhost:8002/api/department/edit` → `API_ENDPOINTS.DEPARTMENTS.UPDATE`
   - Replace: `http://localhost:8002/api/department/delete` → `API_ENDPOINTS.DEPARTMENTS.DELETE`
   - Replace: `http://localhost:8002/api/department/export` → `API_ENDPOINTS.DEPARTMENTS.EXPORT`
   - Replace: `http://localhost:8002/api/department/import` → `API_ENDPOINTS.DEPARTMENTS.IMPORT`
   - Replace: `http://localhost:8002/api/department/import-template` → `API_ENDPOINTS.DEPARTMENTS.IMPORT_TEMPLATE`

9. ✅ `client/src/components/GroupUsersTab.tsx`
   - Replace: `http://localhost:8002/api/user-groups/group/{id}` → `API_ENDPOINTS.USER_GROUPS.BY_GROUP(id)`

10. ✅ `client/src/components/UserGroupsDialog.tsx`
    - Replace: `http://localhost:8002/api/sys-groups` → `API_ENDPOINTS.SYS_GROUPS.LIST`
    - Replace: `http://localhost:8002/api/users/{id}/groups` → `API_ENDPOINTS.USERS.GROUPS(id)`

### 🟡 Priority Medium (Relative paths) - 10 files

11. ✅ `client/src/pages/Dashboard.tsx`
    - Replace: `/api/stats` → `API_ENDPOINTS.STATS.OVERVIEW`
    - Replace: `/api/systems` → `API_ENDPOINTS.SYSTEMS.LIST`
    - Replace: `/api/alerts/active` → `API_ENDPOINTS.ALERTS.ACTIVE`
    - Replace: `/api/alerts/${id}/acknowledge` → `API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id)`

12. ✅ `client/src/pages/Alerts.tsx`
    - Replace: `/api/alerts` → `API_ENDPOINTS.ALERTS.LIST`
    - Replace: `/api/systems` → `API_ENDPOINTS.SYSTEMS.LIST`
    - Replace: `/api/alerts/${id}/acknowledge` → `API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id)`

13. ✅ `client/src/pages/ConfigSystems.tsx`
    - Replace: `/api/systems` → `API_ENDPOINTS.SYSTEMS.LIST`

14. ✅ `client/src/pages/ConfigContacts.tsx`
    - Replace: `/api/contacts` → `API_ENDPOINTS.CONTACTS.LIST`

15. ✅ `client/src/pages/ConfigGroups.tsx`
    - Replace: `/api/groups` → `API_ENDPOINTS.GROUPS.LIST`

16. ✅ `client/src/pages/ConfigRules.tsx`
    - Replace: `/api/rules` → `API_ENDPOINTS.RULES.LIST`

17. ✅ `client/src/pages/Reports.tsx`
    - Replace: `/api/incidents` → `API_ENDPOINTS.INCIDENTS.LIST`

18. ✅ `client/src/pages/Schedules.tsx`
    - Replace: `/api/schedules` → `API_ENDPOINTS.SCHEDULES.LIST`
    - Replace: `/api/contacts` → `API_ENDPOINTS.CONTACTS.LIST`
    - Replace: `/api/systems` → `API_ENDPOINTS.SYSTEMS.LIST`

19. ✅ `client/src/pages/Login.tsx`
    - Replace: `/api/auth/login` → `API_ENDPOINTS.AUTH.LOGIN`

20. ✅ `client/src/lib/auth-context.tsx`
    - Replace: `/api/auth/logout` → `API_ENDPOINTS.AUTH.LOGOUT`

---

## ✅ Benefits sau khi refactor

1. **Easy Configuration**: Chỉ cần sửa 1 chỗ trong `api-config.ts` để thay đổi base URL
2. **Type Safety**: TypeScript autocomplete cho tất cả endpoints
3. **Maintainability**: Dễ dàng thêm/sửa/xóa endpoints
4. **Consistency**: Đồng nhất cách gọi API trong toàn project
5. **Testing**: Dễ dàng mock endpoints khi viết test
6. **Documentation**: Tất cả endpoints được document ở 1 nơi

---

## 🚀 Deployment Configuration

### Development (.env.development):
```bash
VITE_BACKEND_URL=http://localhost:8002
```

### Production (docker-compose.yml):
```yaml
# Không cần set VITE_BACKEND_URL
# Nginx sẽ proxy /api/* sang backend:8002
```

### Alternative: Direct Backend Connection trong Production
```yaml
env_file:
  - trucca-web.env

# trucca-web.env:
VITE_BACKEND_URL=http://production-backend-host:8002
```

---

## 📋 Testing Plan

### 1. Unit Testing
- ✅ Test `buildQueryString()` với các params khác nhau
- ✅ Test `getApiUrl()` với và không có params
- ✅ Test API_ENDPOINTS returns correct URLs

### 2. Integration Testing
- ✅ Test API calls trong development mode (direct connection)
- ✅ Test API calls trong production mode (nginx proxy)
- ✅ Test error handling khi backend không available

### 3. Manual Testing Checklist
- [ ] Login/Logout works
- [ ] Dashboard loads stats, systems, alerts
- [ ] User Management CRUD operations
- [ ] Role Management CRUD operations
- [ ] Permission Management works
- [ ] All import/export functions work
- [ ] All config pages work (AlertFrequency, SystemLevel, OperationTypes)

---

## ⏱️ Estimated Timeline

| Phase | Tasks | Time Estimate |
|-------|-------|---------------|
| Phase 1 | Create api-config.ts & api-endpoints.ts | 1 hour |
| Phase 2 | Refactor 10 high-priority files (hardcoded URLs) | 3 hours |
| Phase 3 | Refactor 10 medium-priority files (relative paths) | 2 hours |
| Phase 4 | Testing & bug fixes | 2 hours |
| **Total** | | **8 hours** |

---

## ❓ Questions & Decisions Needed

1. **File name**: Giữ tên `api-endpoints.ts` hay đổi tên khác? (recommendation: giữ nguyên)
2. **Backward compatibility**: Có cần giữ lại file cũ trong 1 thời gian? (recommendation: không cần)
3. **Environment variables**: Có cần thêm biến môi trường nào khác? (recommendation: không cần)
4. **Testing**: Có cần viết unit tests cho api-config và api-endpoints? (recommendation: có)

---

## 📌 Notes

- File tham khảo `src/lib/api-endpoints.ts` của dự án khác đã được sử dụng làm template
- Pattern hiện tại có 3 loại: `fetch()`, `fetchWithAuth()`, `useQuery` - tất cả đều sẽ được refactor
- Không thay đổi logic business, chỉ refactor API endpoint definitions
- Sau khi refactor, dễ dàng migrate sang REST client library khác (axios, ky, etc.) nếu cần

---

**👉 Vui lòng review và approve để bắt đầu implementation!**
