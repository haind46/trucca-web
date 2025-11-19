# API Refactoring Summary - Progress Report

## ✅ Hoàn thành: 8/22 files

### 1. ✅ api-config.ts (NEW)
- Tạo configuration cho API base URL
- Support cả development và production mode

### 2. ✅ api-endpoints.ts (NEW)
- Định nghĩa tất cả API endpoints
- Có helper functions: `getApiUrl()`, `buildQueryString()`

### 3. ✅ UserManagement.tsx
Refactored 9 URLs:
- `api/sys-groups` → `API_ENDPOINTS.SYS_GROUPS.LIST`
- `api/users` → `API_ENDPOINTS.USERS.LIST`
- `api/users/create` → `API_ENDPOINTS.USERS.CREATE`
- `api/users/edit` → `API_ENDPOINTS.USERS.UPDATE`
- `api/users/delete` → `API_ENDPOINTS.USERS.DELETE`
- `api/users/export` → `API_ENDPOINTS.USERS.EXPORT`
- `api/users/import` → `API_ENDPOINTS.USERS.IMPORT`
- `api/users/copy` → `API_ENDPOINTS.USERS.COPY`
- `api/users/import-template` → `API_ENDPOINTS.USERS.IMPORT_TEMPLATE`

### 4. ✅ ConfigRoles.tsx
Refactored 7 URLs:
- All `api/roles/*` endpoints → `API_ENDPOINTS.ROLES.*`

### 5. ✅ UserGroupManagement.tsx
Refactored 8 URLs:
- All `api/sys-groups/*` endpoints → `API_ENDPOINTS.SYS_GROUPS.*`

### 6. ✅ departmentService.ts
Refactored 7 methods:
- getAll, create, update, delete, export, import, downloadTemplate

### 7. ✅ GroupUsersTab.tsx
Refactored 1 URL:
- `api/user-groups/group/{id}` → `API_ENDPOINTS.USER_GROUPS.BY_GROUP(id)`

### 8. ✅ UserGroupsDialog.tsx
Refactored 2 URLs:
- `api/sys-groups` → `API_ENDPOINTS.SYS_GROUPS.LIST`
- `api/users/{id}/groups` → `API_ENDPOINTS.USERS.GROUPS(id)`

---

## 🔄 Cần làm tiếp: 14 files

### Priority 🔴 High - Hardcoded URLs (4 files)

#### 9. PermissionManagement.tsx
Cần refactor:
```typescript
// Add import
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';

// Replace:
"http://localhost:8002/api/resources" → API_ENDPOINTS.RESOURCES.LIST
"http://localhost:8002/api/resources/create" → API_ENDPOINTS.RESOURCES.CREATE
"http://localhost:8002/api/resources/update" → API_ENDPOINTS.RESOURCES.UPDATE
"http://localhost:8002/api/resources/delete" → API_ENDPOINTS.RESOURCES.DELETE
"http://localhost:8002/api/resources/copy" → API_ENDPOINTS.RESOURCES.COPY
"http://localhost:8002/api/resources/import" → API_ENDPOINTS.RESOURCES.IMPORT
"http://localhost:8002/api/resources/export" → API_ENDPOINTS.RESOURCES.EXPORT
"http://localhost:8002/api/resources/import-template" → API_ENDPOINTS.RESOURCES.IMPORT_TEMPLATE
"http://localhost:8002/api/sys-groups" → API_ENDPOINTS.SYS_GROUPS.LIST
"http://localhost:8002/api/permissions/resources" → API_ENDPOINTS.PERMISSIONS.RESOURCES
"http://localhost:8002/api/permissions/groups" → API_ENDPOINTS.PERMISSIONS.GROUPS
```

#### 10. ConfigAlertFrequency.tsx
Cần refactor:
```typescript
// Add import
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';

// Replace:
"http://localhost:8002/api/alert_frequency" → API_ENDPOINTS.ALERT_FREQUENCY.LIST
"http://localhost:8002/api/alert_frequency/create" → API_ENDPOINTS.ALERT_FREQUENCY.CREATE
"http://localhost:8002/api/alert_frequency/edit" → API_ENDPOINTS.ALERT_FREQUENCY.UPDATE
"http://localhost:8002/api/alert_frequency/delete" → API_ENDPOINTS.ALERT_FREQUENCY.DELETE
"http://localhost:8002/api/alert_frequency/import" → API_ENDPOINTS.ALERT_FREQUENCY.IMPORT
"http://localhost:8002/api/alert_frequency/export" → API_ENDPOINTS.ALERT_FREQUENCY.EXPORT
"http://localhost:8002/api/alert_frequency/template" → API_ENDPOINTS.ALERT_FREQUENCY.TEMPLATE
```

#### 11. ConfigSystemLevel.tsx
Cần refactor:
```typescript
// Add import
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';

// Replace:
"http://localhost:8002/api/systemLevel" → API_ENDPOINTS.SYSTEM_LEVEL.LIST
"http://localhost:8002/api/systemLevel/create" → API_ENDPOINTS.SYSTEM_LEVEL.CREATE
"http://localhost:8002/api/systemLevel/edit" → API_ENDPOINTS.SYSTEM_LEVEL.UPDATE
"http://localhost:8002/api/systemLevel/delete" → API_ENDPOINTS.SYSTEM_LEVEL.DELETE
"http://localhost:8002/api/systemLevel/import" → API_ENDPOINTS.SYSTEM_LEVEL.IMPORT
"http://localhost:8002/api/systemLevel/export" → API_ENDPOINTS.SYSTEM_LEVEL.EXPORT
"http://localhost:8002/api/systemLevel/template" → API_ENDPOINTS.SYSTEM_LEVEL.TEMPLATE
```

#### 12. ConfigOperationTypes.tsx
Cần refactor:
```typescript
// Add import
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';

// Replace:
"http://localhost:8002/api/operation-type" → API_ENDPOINTS.OPERATION_TYPES.LIST
"http://localhost:8002/api/operation-type/create" → API_ENDPOINTS.OPERATION_TYPES.CREATE
"http://localhost:8002/api/operation-type/edit" → API_ENDPOINTS.OPERATION_TYPES.UPDATE
"http://localhost:8002/api/operation-type/delete" → API_ENDPOINTS.OPERATION_TYPES.DELETE
"http://localhost:8002/api/operation-type/copy" → API_ENDPOINTS.OPERATION_TYPES.COPY
"http://localhost:8002/api/operation-type/export" → API_ENDPOINTS.OPERATION_TYPES.EXPORT
"http://localhost:8002/api/operation-type/template" → API_ENDPOINTS.OPERATION_TYPES.TEMPLATE
```

---

### Priority 🟡 Medium - Relative Paths (10 files)

#### 13. Dashboard.tsx
Cần refactor:
```typescript
// Add import
import { API_ENDPOINTS } from '@/lib/api-endpoints';

// Replace in useQuery queryKey:
"/api/stats" → API_ENDPOINTS.STATS.OVERVIEW
"/api/systems" → API_ENDPOINTS.SYSTEMS.LIST
"/api/alerts/active" → API_ENDPOINTS.ALERTS.ACTIVE

// Replace in mutation:
`/api/alerts/${id}/acknowledge` → API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id)
```

#### 14. Alerts.tsx
```typescript
// Replace:
"/api/alerts" → API_ENDPOINTS.ALERTS.LIST
"/api/systems" → API_ENDPOINTS.SYSTEMS.LIST
`/api/alerts/${id}/acknowledge` → API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id)
```

#### 15. ConfigSystems.tsx
```typescript
// Replace:
"/api/systems" → API_ENDPOINTS.SYSTEMS.LIST
```

#### 16. ConfigContacts.tsx
```typescript
// Replace:
"/api/contacts" → API_ENDPOINTS.CONTACTS.LIST
```

#### 17. ConfigGroups.tsx
```typescript
// Replace:
"/api/groups" → API_ENDPOINTS.GROUPS.LIST
```

#### 18. ConfigRules.tsx
```typescript
// Replace:
"/api/rules" → API_ENDPOINTS.RULES.LIST
```

#### 19. Reports.tsx
```typescript
// Replace:
"/api/incidents" → API_ENDPOINTS.INCIDENTS.LIST
```

#### 20. Schedules.tsx
```typescript
// Replace:
"/api/schedules" → API_ENDPOINTS.SCHEDULES.LIST
"/api/contacts" → API_ENDPOINTS.CONTACTS.LIST
"/api/systems" → API_ENDPOINTS.SYSTEMS.LIST
```

#### 21. Login.tsx
```typescript
// Replace:
"/api/auth/login" → API_ENDPOINTS.AUTH.LOGIN
```

#### 22. auth-context.tsx
```typescript
// Replace:
"/api/auth/logout" → API_ENDPOINTS.AUTH.LOGOUT
```

---

## 📊 Thống kê

- **Tổng số files**: 22
- **Đã hoàn thành**: 8 (36%)
- **Còn lại**: 14 (64%)
  - Hardcoded URLs (🔴): 4 files
  - Relative paths (🟡): 10 files

---

## 🎯 Next Steps

1. Tiếp tục refactor 4 files priority cao (PermissionManagement, ConfigAlertFrequency, ConfigSystemLevel, ConfigOperationTypes)
2. Refactor 10 files priority trung bình (Dashboard, Alerts, etc.)
3. Test toàn bộ application
4. Update documentation

---

## ✅ Benefits đã đạt được

1. ✅ API endpoints được centralized trong 1 file duy nhất
2. ✅ Dễ dàng thay đổi base URL khi deploy
3. ✅ Loại bỏ hardcode localhost:8002 trong 8 files
4. ✅ Code clean hơn, dễ maintain
5. ✅ TypeScript autocomplete support

---

Generated: 2025-11-18
