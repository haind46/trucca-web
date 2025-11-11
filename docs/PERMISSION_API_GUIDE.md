# Permission & Group Management API Guide

## M�c l�c
- [T�ng quan](#t�ng-quan)
- [C�u tr�c Database](#c�u-tr�c-database)
- [API Endpoints](#api-endpoints)
  - [1. Group Management](#1-group-management-api)
  - [2. Resource Management](#2-resource-management-api)
  - [3. User-Group Management](#3-user-group-management-api)
  - [4. Permission Management](#4-permission-management-api)
- [Common Flows](#common-flows)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## T�ng quan

H� th�ng qu�n l� nh�m ng��i d�ng v� ph�n quy�n (RBAC - Role-Based Access Control) cho ph�p:
- Qu�n l� nh�m ng��i d�ng (Groups)
- Qu�n l� t�i nguy�n h� th�ng (Resources: menus, APIs, buttons)
- G�n ng��i d�ng v�o nh�m
- Ph�n quy�n truy c�p t�i nguy�n cho nh�m
- Ki�m tra quy�n truy c�p c�a ng��i d�ng

### Lu�ng ho�t �ng ch�nh:
```
User � UserGroup � Group � Permission � Resource
```

1. User ��c g�n v�o m�t ho�c nhi�u Groups
2. Group ��c ph�n quy�n truy c�p c�c Resources
3. User k� th�a t�t c� quy�n t� c�c Groups m� h� thu�c v�

---

## C�u tr�c Database

### 1. sys_group - B�ng nh�m ng��i d�ng
```sql
CREATE TABLE sys_group (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER,
  updated_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2. sys_resource - B�ng t�i nguy�n/ch�c nng
```sql
CREATE TABLE sys_resource (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,  -- 'menu', 'api', 'button'
  path VARCHAR(255),
  method VARCHAR(10),  -- 'GET', 'POST', 'PUT', 'DELETE'
  parent_id INTEGER REFERENCES sys_resource(id),
  sort_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3. sys_user_group - B�ng map User-Group
```sql
CREATE TABLE sys_user_group (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,  -- UUID from sys_user
  group_id INTEGER NOT NULL REFERENCES sys_group(id),
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);
```

### 4. sys_permission - B�ng ph�n quy�n Group-Resource
```sql
CREATE TABLE sys_permission (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES sys_group(id),
  resource_id INTEGER NOT NULL REFERENCES sys_resource(id),
  can_access BOOLEAN NOT NULL DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, resource_id)
);
```

---

## API Endpoints

Base URL: `http://localhost:8002`

### Response Format
T�t c� APIs �u tr� v� theo format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "statusCode": 200
}
```

---

## 1. Group Management API

### 1.1. L�y danh s�ch nh�m (List Groups)

**Endpoint:** `GET /api/sys-groups`

**Query Parameters:**
- `page` (integer, default=1) - S� trang
- `limit` (integer, default=10) - S� items/trang
- `keyWord` (string, optional) - T� kh�a t�m ki�m
- `sort_dir` (string, default="desc") - H��ng s�p x�p (asc/desc)
- `sort_key` (string, default="id") - Tr��ng s�p x�p (id/name/code/created_at)

**Example Request:**
```bash
GET /api/sys-groups?page=1&limit=10&keyWord=admin&sort_dir=desc&sort_key=created_at
```

**Example Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Qu�n tr� vi�n",
        "code": "ADMIN",
        "description": "Qu�n tr� vi�n h� th�ng",
        "status": "active",
        "isSystem": true,
        "createdBy": null,
        "updatedBy": null,
        "createdAt": "2025-01-10T10:00:00",
        "updatedAt": "2025-01-10T10:00:00"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 1,
    "size": 10
  },
  "statusCode": 200
}
```

---

### 1.2. L�y nh�m theo ID

**Endpoint:** `GET /api/sys-groups/{id}`

**Path Parameters:**
- `id` (integer, required) - Group ID

**Example Request:**
```bash
GET /api/sys-groups/1
```

**Example Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Qu�n tr� vi�n",
    "code": "ADMIN",
    "description": "Qu�n tr� vi�n h� th�ng",
    "status": "active",
    "isSystem": true,
    "createdAt": "2025-01-10T10:00:00",
    "updatedAt": "2025-01-10T10:00:00"
  },
  "statusCode": 200
}
```

---

### 1.3. T�o nh�m m�i

**Endpoint:** `POST /api/sys-groups/create`

**Request Body:**
```json
{
  "name": "Qu�n l� b�o c�o",
  "code": "REPORT_MANAGER",
  "description": "Qu�n l� v� xem c�c b�o c�o th�ng k�",
  "status": "active",
  "isSystem": false
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "id": 6,
    "name": "Qu�n l� b�o c�o",
    "code": "REPORT_MANAGER",
    "description": "Qu�n l� v� xem c�c b�o c�o th�ng k�",
    "status": "active",
    "isSystem": false,
    "createdAt": "2025-01-10T15:30:00",
    "updatedAt": "2025-01-10T15:30:00"
  },
  "statusCode": 200
}
```

**Validation Rules:**
- `name`: Required, unique, max 100 chars
- `code`: Required, unique, max 50 chars, ch� ch� HOA/s�/underscore
- `status`: Must be "active" or "inactive"

---

### 1.4. C�p nh�t nh�m

**Endpoint:** `PUT /api/sys-groups/update/{id}`

**Path Parameters:**
- `id` (integer, required) - Group ID

**Request Body:**
```json
{
  "name": "Qu�n l� b�o c�o Pro",
  "code": "REPORT_MANAGER_PRO",
  "description": "Qu�n l� b�o c�o n�ng cao",
  "status": "active"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Group updated successfully",
  "data": { ... },
  "statusCode": 200
}
```

**Business Rules:**
- Kh�ng ��c update nh�m h� th�ng (isSystem = true)
- Code v� name ph�i unique (tr� ch�nh n�)

---

### 1.5. X�a nh�m

**Endpoint:** `DELETE /api/sys-groups/delete/{id}`

**Path Parameters:**
- `id` (integer, required) - Group ID

**Example Response:**
```json
{
  "success": true,
  "message": "Group deleted successfully",
  "data": null,
  "statusCode": 200
}
```

**Business Rules:**
- Kh�ng ��c x�a nh�m h� th�ng (isSystem = true)
- Cascade delete: X�a t�t c� user_group v� permission li�n quan

---

### 1.6. X�a nhi�u nh�m

**Endpoint:** `POST /api/sys-groups/delete`

**Query Parameters:**
- `ids` (List<Integer>, required) - Danh s�ch Group IDs

**Example Request:**
```bash
POST /api/sys-groups/delete?ids=6,7,8
```

**Example Response:**
```json
{
  "success": true,
  "message": "3 groups deleted successfully",
  "data": null,
  "statusCode": 200
}
```

---

### 1.7. Sao ch�p nh�m

**Endpoint:** `POST /api/sys-groups/copy`

**Query Parameters:**
- `sourceId` (integer, required) - ID nh�m ngu�n
- `newCode` (string, required) - M� nh�m m�i
- `newName` (string, required) - T�n nh�m m�i

**Example Request:**
```bash
POST /api/sys-groups/copy?sourceId=1&newCode=ADMIN_COPY&newName=Admin Copy
```

**Example Response:**
```json
{
  "success": true,
  "message": "Group copied successfully",
  "data": {
    "id": 9,
    "name": "Admin Copy",
    "code": "ADMIN_COPY",
    "description": "Qu�n tr� vi�n h� th�ng (Copy)",
    "status": "active",
    "isSystem": false
  },
  "statusCode": 200
}
```

---

### 1.8. Thay �i tr�ng th�i

**Endpoint:** `PATCH /api/sys-groups/{id}/status`

**Path Parameters:**
- `id` (integer, required) - Group ID

**Query Parameters:**
- `status` (string, required) - "active" ho�c "inactive"

**Example Request:**
```bash
PATCH /api/sys-groups/5/status?status=inactive
```

**Example Response:**
```json
{
  "success": true,
  "message": "Group status updated successfully",
  "data": { ... },
  "statusCode": 200
}
```

---

### 1.9. Import t� file

**Endpoint:** `POST /api/sys-groups/import`

**Request:** `multipart/form-data`
- `file` (file, required) - File CSV, TXT, ho�c Excel

**Excel/CSV Format:**
```
Name,Code,Description,Status,IsSystem
Nh�m m�i,NEW_GROUP,M� t� nh�m m�i,active,false
```

**Example Response:**
```json
{
  "success": true,
  "message": "Imported 5 groups successfully",
  "data": [ ... ],
  "statusCode": 200
}
```

---

### 1.10. Export ra Excel

**Endpoint:** `GET /api/sys-groups/export`

**Response:** File Excel (.xlsx)
- Content-Type: `application/octet-stream`
- Filename: `groups_export.xlsx`

---

### 1.11. T�i template import

**Endpoint:** `GET /api/sys-groups/import-template`

**Response:** File Excel (.xlsx) v�i sample data
- Content-Type: `application/octet-stream`
- Filename: `groups_import_template.xlsx`

---

## 2. Resource Management API

### 2.1. L�y danh s�ch t�i nguy�n

**Endpoint:** `GET /api/resources`

**Query Parameters:**
- `page`, `limit`, `keyWord`, `sort_dir`, `sort_key` (t��ng t� Group API)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Qu�n tr� h� th�ng",
        "code": "ADMIN",
        "type": "menu",
        "path": "/admin",
        "method": null,
        "parentId": null,
        "sortOrder": 1,
        "icon": "Settings",
        "description": null,
        "status": "active",
        "isSystem": true,
        "createdAt": "2025-01-10T10:00:00",
        "updatedAt": "2025-01-10T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 1
  },
  "statusCode": 200
}
```

---

### 2.2. L�y c�y menu (Tree Structure)

**Endpoint:** `GET /api/resources/tree`

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Qu�n tr� h� th�ng",
      "code": "ADMIN",
      "type": "menu",
      "path": "/admin",
      "icon": "Settings",
      "sortOrder": 1,
      "children": [
        {
          "id": 2,
          "name": "Qu�n l� ng��i d�ng",
          "code": "ADMIN_USERS",
          "type": "menu",
          "path": "/admin/users",
          "parentId": 1,
          "sortOrder": 1,
          "children": [
            {
              "id": 3,
              "name": "Xem danh s�ch ng��i d�ng",
              "code": "ADMIN_USERS_VIEW",
              "type": "api",
              "path": "/api/users",
              "method": "GET",
              "parentId": 2,
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "statusCode": 200
}
```

---

### 2.3. L�y t�i nguy�n theo lo�i

**Endpoint:** `GET /api/resources/type/{type}`

**Path Parameters:**
- `type` (string, required) - "menu", "api", ho�c "button"

**Example Request:**
```bash
GET /api/resources/type/menu
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dashboard",
      "code": "DASHBOARD",
      "type": "menu",
      "path": "/",
      "icon": "LayoutDashboard"
    },
    {
      "id": 2,
      "name": "Qu�n tr� h� th�ng",
      "code": "ADMIN",
      "type": "menu",
      "path": "/admin",
      "icon": "Settings"
    }
  ],
  "statusCode": 200
}
```

---

### 2.4. T�o t�i nguy�n m�i

**Endpoint:** `POST /api/resources/create`

**Request Body:**
```json
{
  "name": "B�o c�o doanh thu",
  "code": "REPORTS_REVENUE",
  "type": "menu",
  "path": "/reports/revenue",
  "parentId": 10,
  "sortOrder": 1,
  "icon": "DollarSign",
  "description": "B�o c�o doanh thu h� th�ng",
  "status": "active",
  "isSystem": false
}
```

**Validation:**
- `type` = "menu": method ph�i null
- `type` = "api": method b�t bu�c (GET/POST/PUT/DELETE/PATCH)
- `code`: Unique, ch� HOA/s�/underscore

**Example Response:**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { ... },
  "statusCode": 200
}
```

---

### 2.5. C�p nh�t t�i nguy�n

**Endpoint:** `PUT /api/resources/update/{id}`

**Business Rules:**
- Kh�ng ��c update system resources (isSystem = true)
- Validation t��ng t� create

---

### 2.6. X�a t�i nguy�n

**Endpoint:** `DELETE /api/resources/delete/{id}`

**Business Rules:**
- Kh�ng ��c x�a system resources
- Kh�ng ��c x�a resources c� children
- Cascade delete permissions li�n quan

---

### 2.7-2.11. C�c API kh�c

T��ng t� Group API:
- `POST /api/resources/delete?ids=...` - X�a nhi�u
- `POST /api/resources/copy` - Sao ch�p
- `PATCH /api/resources/{id}/status` - �i tr�ng th�i
- `POST /api/resources/import` - Import
- `GET /api/resources/export` - Export
- `GET /api/resources/import-template` - T�i template

---

## 3. User-Group Management API

### 3.1. G�n user v�o nh�m

**Endpoint:** `POST /api/user-groups/assign`

**Request Body:**
```json
{
  "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
  "groupIds": [1, 2, 5]
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "User assigned to 3 groups successfully",
  "data": [
    {
      "id": 15,
      "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
      "user": {
        "id": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
        "username": "john.doe",
        "fullname": "John Doe"
      },
      "groupId": 1,
      "group": {
        "id": 1,
        "name": "Qu�n tr� vi�n",
        "code": "ADMIN"
      },
      "createdAt": "2025-01-10T16:00:00"
    }
  ],
  "statusCode": 200
}
```

**Business Rules:**
- userId ph�i t�n t�i trong sys_user
- groupId ph�i t�n t�i trong sys_group
- Skip n�u mapping � t�n t�i (kh�ng throw error)

---

### 3.2. X�a user kh�i nh�m

**Endpoint:** `DELETE /api/user-groups/remove`

**Query Parameters:**
- `userId` (string, required) - User UUID
- `groupIds` (List<Integer>, required) - Danh s�ch Group IDs

**Example Request:**
```bash
DELETE /api/user-groups/remove?userId=611f33fd-b5a1-4a6e-a38c-c30ae20900b0&groupIds=1,2
```

**Example Response:**
```json
{
  "success": true,
  "message": "User removed from 2 groups successfully",
  "data": null,
  "statusCode": 200
}
```

---

### 3.3. L�y danh s�ch nh�m c�a user

**Endpoint:** `GET /api/user-groups/user/{userId}`

**Path Parameters:**
- `userId` (string, required) - User UUID

**Example Request:**
```bash
GET /api/user-groups/user/611f33fd-b5a1-4a6e-a38c-c30ae20900b0
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
      "groupId": 1,
      "group": {
        "id": 1,
        "name": "Qu�n tr� vi�n",
        "code": "ADMIN",
        "description": "Qu�n tr� vi�n h� th�ng"
      },
      "createdAt": "2025-01-10T16:00:00"
    },
    {
      "id": 16,
      "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
      "groupId": 2,
      "group": {
        "id": 2,
        "name": "Ng��i d�ng",
        "code": "USER"
      },
      "createdAt": "2025-01-10T16:05:00"
    }
  ],
  "statusCode": 200
}
```

---

### 3.4. L�y danh s�ch user trong nh�m

**Endpoint:** `GET /api/user-groups/group/{groupId}`

**Path Parameters:**
- `groupId` (integer, required) - Group ID

**Query Parameters:**
- `page` (integer, default=1)
- `limit` (integer, default=10)

**Example Request:**
```bash
GET /api/user-groups/group/1?page=1&limit=10
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 15,
        "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
        "user": {
          "id": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
          "username": "john.doe",
          "fullname": "John Doe",
          "email": "john@example.com"
        },
        "groupId": 1,
        "createdAt": "2025-01-10T16:00:00"
      }
    ],
    "totalElements": 25,
    "totalPages": 3,
    "currentPage": 1
  },
  "statusCode": 200
}
```

---

### 3.5. X�a mapping c� th�

**Endpoint:** `DELETE /api/user-groups/{id}`

**Path Parameters:**
- `id` (integer, required) - UserGroup mapping ID

**Example Response:**
```json
{
  "success": true,
  "message": "User-group mapping deleted successfully",
  "data": null,
  "statusCode": 200
}
```

---

## 4. Permission Management API

### 4.1. L�y t�t c� t�i nguy�n (grouped by type)

**Endpoint:** `GET /api/permissions/resources`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "menu": [
      {
        "id": 1,
        "name": "Dashboard",
        "code": "DASHBOARD",
        "type": "menu",
        "path": "/",
        "icon": "LayoutDashboard"
      }
    ],
    "api": [
      {
        "id": 3,
        "name": "Xem danh s�ch ng��i d�ng",
        "code": "ADMIN_USERS_VIEW",
        "type": "api",
        "path": "/api/users",
        "method": "GET"
      }
    ],
    "button": [
      {
        "id": 50,
        "name": "N�t x�a",
        "code": "BTN_DELETE",
        "type": "button"
      }
    ]
  },
  "statusCode": 200
}
```

---

### 4.2. Xem quy�n c�a nh�m

**Endpoint:** `GET /api/permissions/groups/{groupId}`

**Path Parameters:**
- `groupId` (integer, required) - Group ID

**Example Request:**
```bash
GET /api/permissions/groups/1
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "groupId": 1,
      "resourceId": 1,
      "resource": {
        "id": 1,
        "name": "Dashboard",
        "code": "DASHBOARD",
        "type": "menu",
        "path": "/",
        "icon": "LayoutDashboard"
      },
      "canAccess": true,
      "createdAt": "2025-01-10T10:00:00"
    },
    {
      "id": 102,
      "groupId": 1,
      "resourceId": 3,
      "resource": {
        "id": 3,
        "name": "Xem danh s�ch ng��i d�ng",
        "code": "ADMIN_USERS_VIEW",
        "type": "api",
        "path": "/api/users",
        "method": "GET"
      },
      "canAccess": true,
      "createdAt": "2025-01-10T10:00:00"
    }
  ],
  "statusCode": 200
}
```

---

### 4.3. C�p nh�t quy�n cho nh�m (Bulk Update)

**Endpoint:** `PUT /api/permissions/groups/{groupId}`

**Path Parameters:**
- `groupId` (integer, required) - Group ID

**Request Body:**
```json
{
  "resourceIds": [1, 2, 3, 5, 10, 15],
  "canAccess": true
}
```

**Process:**
1. X�a t�t c� permissions ci c�a group
2. T�o m�i permissions theo resourceIds
3. Set canAccess theo request

**Example Response:**
```json
{
  "success": true,
  "message": "Group permissions updated successfully. 6 permissions granted.",
  "data": [
    {
      "id": 201,
      "groupId": 5,
      "resourceId": 1,
      "canAccess": true,
      "createdAt": "2025-01-10T17:00:00"
    }
    // ... 5 more
  ],
  "statusCode": 200
}
```

**Business Rules:**
- Kh�ng ��c g�n quy�n cho system resources (isSystem = true)
- resourceIds ph�i t�n t�i
- groupId ph�i t�n t�i

---

### 4.4. Xem quy�n t�ng h�p c�a user

**Endpoint:** `GET /api/permissions/users/{userId}`

**Path Parameters:**
- `userId` (string, required) - User UUID

**Example Request:**
```bash
GET /api/permissions/users/611f33fd-b5a1-4a6e-a38c-c30ae20900b0
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
    "groupIds": [1, 2, 5],
    "accessibleResources": [
      {
        "id": 1,
        "name": "Dashboard",
        "code": "DASHBOARD",
        "type": "menu",
        "path": "/",
        "icon": "LayoutDashboard"
      },
      {
        "id": 3,
        "name": "Xem danh s�ch ng��i d�ng",
        "code": "ADMIN_USERS_VIEW",
        "type": "api",
        "path": "/api/users",
        "method": "GET"
      }
      // ... t�t c� resources t� c�c groups
    ],
    "totalResources": 45
  },
  "statusCode": 200
}
```

**Logic:**
1. L�y t�t c� groupIds c�a user t� sys_user_group
2. L�y t�t c� permissions c�a c�c groups �
3. Merge (union) t�t c� resources
4. Tr� v� danh s�ch unique resources

---

### 4.5. Ki�m tra quy�n truy c�p

**Endpoint:** `POST /api/permissions/check`

**Request Body:**
```json
{
  "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
  "resourceCode": "ADMIN_USERS_VIEW"
}
```

**Example Response (C� quy�n):**
```json
{
  "success": true,
  "data": {
    "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
    "resourceCode": "ADMIN_USERS_VIEW",
    "hasAccess": true,
    "message": "User has access to this resource"
  },
  "statusCode": 200
}
```

**Example Response (Kh�ng c� quy�n):**
```json
{
  "success": true,
  "data": {
    "userId": "611f33fd-b5a1-4a6e-a38c-c30ae20900b0",
    "resourceCode": "ADMIN_USERS_DELETE",
    "hasAccess": false,
    "message": "User does not have access to this resource"
  },
  "statusCode": 200
}
```

**Logic:**
1. L�y t�t c� groupIds c�a user
2. T�m resource theo resourceCode
3. Check xem c� permission n�o (group_id IN groupIds AND resource_id = resourceId AND can_access = true)
4. Tr� v� hasAccess = true n�u t�m th�y

---

## Common Flows

### Flow 1: T�o nh�m m�i v� ph�n quy�n

```
1. POST /api/sys-groups/create
   � T�o group "REPORT_MANAGER"

2. GET /api/permissions/resources
   � L�y danh s�ch t�t c� resources � hi�n th�

3. PUT /api/permissions/groups/{groupId}
   � G�n quy�n truy c�p cho group
   Body: { resourceIds: [1, 5, 10, 20], canAccess: true }

4. POST /api/user-groups/assign
   � G�n users v�o group
   Body: { userId: "...", groupIds: [6] }
```

### Flow 2: Ki�m tra quy�n c�a user

```
1. GET /api/user-groups/user/{userId}
   � L�y danh s�ch groups c�a user

2. GET /api/permissions/users/{userId}
   � L�y t�t c� resources user c� quy�n

3. POST /api/permissions/check
   � Check xem user c� quy�n truy c�p resource c� th� kh�ng
   Body: { userId: "...", resourceCode: "ADMIN_USERS_VIEW" }
```

### Flow 3: Permission Matrix UI

```
1. GET /api/sys-groups
   � L�y danh s�ch groups (hi�n th� h�ng ngang)

2. GET /api/permissions/resources
   � L�y danh s�ch resources (hi�n th� c�t d�c)

3. For each group:
   GET /api/permissions/groups/{groupId}
   � L�y permissions � render checkbox matrix

4. User thay �i permissions:
   PUT /api/permissions/groups/{groupId}
   � Update to�n b� permissions c�a group
```

---

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "code": "Code must contain only uppercase letters, numbers, and underscores"
  },
  "statusCode": 400
}
```

**403 Forbidden - System Resource:**
```json
{
  "success": false,
  "message": "Cannot delete system group",
  "data": null,
  "statusCode": 403
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Group not found with ID: 999",
  "data": null,
  "statusCode": 404
}
```

**409 Conflict - Duplicate:**
```json
{
  "success": false,
  "message": "Group with code 'ADMIN' already exists",
  "data": null,
  "statusCode": 409
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An error occurred while processing request",
  "data": null,
  "statusCode": 500
}
```

---

## Best Practices

### 1. Pagination
- Lu�n s� d�ng pagination cho danh s�ch l�n
- Default: page=1, limit=10
- Max limit n�n l� 100

### 2. Searching
- Keyword search h� tr� t�m g�n �ng (LIKE %keyword%)
- Search trong nhi�u tr��ng: id, name, code, description

### 3. Sorting
- H� tr� sort theo nhi�u fields
- Frontend g�i camelCase (createdAt), backend t� convert sang snake_case (created_at)

### 4. Caching
- Cache danh s�ch resources (�t thay �i)
- Cache permissions c�a user (invalidate khi update group permissions ho�c user-group mapping)

### 5. Security
- Validate t�t c� input
- Kh�ng cho ph�p update/delete system resources v� system groups
- Check quy�n tr��c khi th�c hi�n sensitive operations

### 6. Performance
- S� d�ng bulk operations (assign multiple users, update multiple permissions)
- Index �y � tr�n foreign keys
- Pagination cho danh s�ch l�n

### 7. Import/Export
- Validate d� li�u tr��c khi import
- Skip duplicates thay v� throw error
- Download template tr��c khi import � �ng format

---

## Swagger UI

T�t c� APIs �u ��c document �y � t�i:
```
http://localhost:8002/swagger-ui/index.html
```

B�n c� th� test tr�c ti�p c�c APIs t� Swagger UI.

---


**Version:** 1.0.0
**Last Updated:** 2025-01-10
