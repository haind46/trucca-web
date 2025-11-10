# Hướng dẫn thiết kế hệ thống Quản lý nhóm người dùng và Phân quyền

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Thiết kế Database](#thiết-kế-database)
3. [API Endpoints](#api-endpoints)
4. [Triển khai Backend](#triển-khai-backend)
5. [Ví dụ sử dụng](#ví-dụ-sử-dụng)

---

## Tổng quan

Hệ thống phân quyền được thiết kế theo mô hình RBAC (Role-Based Access Control) với các thành phần chính:

- **sys_user**: Bảng người dùng (đã có sẵn)
- **sys_group**: Nhóm người dùng
- **sys_permission**: Quyền truy cập vào các chức năng
- **sys_user_group**: Bảng map giữa người dùng và nhóm (many-to-many)
- **sys_group_permission**: Bảng map giữa nhóm và quyền (many-to-many)
- **sys_resource**: Định nghĩa các tài nguyên (API endpoints, routes)

---

## Thiết kế Database

### 1. Bảng sys_group (Nhóm người dùng)

```sql
CREATE TABLE sys_group (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive
  is_system BOOLEAN NOT NULL DEFAULT false, -- Nhóm hệ thống không thể xóa
  created_by INTEGER REFERENCES sys_user(id),
  updated_by INTEGER REFERENCES sys_user(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sys_group_code ON sys_group(code);
CREATE INDEX idx_sys_group_status ON sys_group(status);

-- Comments
COMMENT ON TABLE sys_group IS 'Bảng quản lý nhóm người dùng';
COMMENT ON COLUMN sys_group.code IS 'Mã nhóm duy nhất, dùng trong code';
COMMENT ON COLUMN sys_group.is_system IS 'Nhóm hệ thống: admin, user, guest';
```

**Dữ liệu mẫu:**
```sql
INSERT INTO sys_group (name, code, description, is_system) VALUES
('Quản trị viên', 'ADMIN', 'Quản trị viên hệ thống, có toàn quyền', true),
('Người dùng', 'USER', 'Người dùng thông thường', true),
('Người xem', 'VIEWER', 'Chỉ có quyền xem', true),
('Quản lý hệ thống', 'SYSTEM_MANAGER', 'Quản lý cấu hình hệ thống', false),
('Quản lý báo cáo', 'REPORT_MANAGER', 'Quản lý và xem báo cáo', false);
```

### 2. Bảng sys_user_group (Map người dùng - nhóm)

```sql
CREATE TABLE sys_user_group (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES sys_user(id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES sys_group(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES sys_user(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Indexes
CREATE INDEX idx_sys_user_group_user ON sys_user_group(user_id);
CREATE INDEX idx_sys_user_group_group ON sys_user_group(group_id);

COMMENT ON TABLE sys_user_group IS 'Bảng map quan hệ nhiều-nhiều giữa người dùng và nhóm';
```

### 3. Bảng sys_resource (Tài nguyên/Chức năng)

```sql
CREATE TABLE sys_resource (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL, -- menu, api, button
  path VARCHAR(255), -- Route path hoặc API endpoint
  method VARCHAR(10), -- GET, POST, PUT, DELETE (cho API)
  parent_id INTEGER REFERENCES sys_resource(id),
  sort_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sys_resource_code ON sys_resource(code);
CREATE INDEX idx_sys_resource_type ON sys_resource(type);
CREATE INDEX idx_sys_resource_parent ON sys_resource(parent_id);
CREATE INDEX idx_sys_resource_path_method ON sys_resource(path, method);

COMMENT ON TABLE sys_resource IS 'Bảng định nghĩa các tài nguyên và chức năng hệ thống';
COMMENT ON COLUMN sys_resource.type IS 'menu: Menu sidebar, api: API endpoint, button: Nút chức năng';
```

**Dữ liệu mẫu:**
```sql
-- Menu cấp 1: Quản trị hệ thống
INSERT INTO sys_resource (name, code, type, path, icon, sort_order, is_system) VALUES
('Quản trị hệ thống', 'ADMIN', 'menu', '/admin', 'Settings', 1, true);

SET @admin_menu_id = LASTVAL();

-- Menu cấp 2 và API endpoints cho Quản lý người dùng
INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
('Quản lý người dùng', 'ADMIN_USERS', 'menu', '/admin/users', 'UserCog', @admin_menu_id, 1, true);

SET @users_menu_id = LASTVAL();

-- API endpoints cho Quản lý người dùng
INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
('Xem danh sách người dùng', 'ADMIN_USERS_VIEW', 'api', '/api/users', 'GET', @users_menu_id, true),
('Thêm người dùng', 'ADMIN_USERS_CREATE', 'api', '/api/users', 'POST', @users_menu_id, true),
('Sửa người dùng', 'ADMIN_USERS_UPDATE', 'api', '/api/users/:id', 'PUT', @users_menu_id, true),
('Xóa người dùng', 'ADMIN_USERS_DELETE', 'api', '/api/users/:id', 'DELETE', @users_menu_id, true);

-- Menu cấp 2 và API endpoints cho Quản lý nhóm người dùng
INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
('Quản lý nhóm người dùng', 'ADMIN_GROUPS', 'menu', '/admin/user-groups', 'Users', @admin_menu_id, 2, true);

SET @groups_menu_id = LASTVAL();

INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
('Xem danh sách nhóm', 'ADMIN_GROUPS_VIEW', 'api', '/api/user-groups', 'GET', @groups_menu_id, true),
('Thêm nhóm', 'ADMIN_GROUPS_CREATE', 'api', '/api/user-groups', 'POST', @groups_menu_id, true),
('Sửa nhóm', 'ADMIN_GROUPS_UPDATE', 'api', '/api/user-groups/:id', 'PUT', @groups_menu_id, true),
('Xóa nhóm', 'ADMIN_GROUPS_DELETE', 'api', '/api/user-groups/:id', 'DELETE', @groups_menu_id, true),
('Thêm người dùng vào nhóm', 'ADMIN_GROUPS_ADD_USER', 'api', '/api/user-groups/:id/users', 'POST', @groups_menu_id, true),
('Xóa người dùng khỏi nhóm', 'ADMIN_GROUPS_REMOVE_USER', 'api', '/api/user-groups/:id/users/:userId', 'DELETE', @groups_menu_id, true);

-- Menu Phân quyền
INSERT INTO sys_resource (name, code, type, path, icon, parent_id, sort_order, is_system) VALUES
('Phân quyền', 'ADMIN_PERMISSIONS', 'menu', '/admin/permissions', 'Shield', @admin_menu_id, 3, true);

SET @perms_menu_id = LASTVAL();

INSERT INTO sys_resource (name, code, type, path, method, parent_id, is_system) VALUES
('Xem phân quyền', 'ADMIN_PERMISSIONS_VIEW', 'api', '/api/permissions', 'GET', @perms_menu_id, true),
('Cập nhật phân quyền nhóm', 'ADMIN_PERMISSIONS_UPDATE', 'api', '/api/permissions/groups/:id', 'PUT', @perms_menu_id, true);
```

### 4. Bảng sys_permission (Quyền của nhóm)

```sql
CREATE TABLE sys_permission (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES sys_group(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES sys_resource(id) ON DELETE CASCADE,
  can_access BOOLEAN NOT NULL DEFAULT true,
  created_by INTEGER REFERENCES sys_user(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, resource_id)
);

-- Indexes
CREATE INDEX idx_sys_permission_group ON sys_permission(group_id);
CREATE INDEX idx_sys_permission_resource ON sys_permission(resource_id);
CREATE INDEX idx_sys_permission_access ON sys_permission(group_id, resource_id, can_access);

COMMENT ON TABLE sys_permission IS 'Bảng phân quyền: nhóm nào được truy cập tài nguyên nào';
COMMENT ON COLUMN sys_permission.can_access IS 'Cho phép truy cập tài nguyên';
```

---

## Thiết kế Schema (Drizzle ORM)

### File: `shared/schema.ts`

```typescript
import { pgTable, text, serial, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== SYS_GROUP ====================
export const sysGroup = pgTable("sys_group", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  isSystem: boolean("is_system").notNull().default(false),
  createdBy: integer("created_by"),
  updatedBy: integer("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSysGroupSchema = createInsertSchema(sysGroup).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSysGroup = z.infer<typeof insertSysGroupSchema>;
export type SysGroup = typeof sysGroup.$inferSelect;

// ==================== SYS_USER_GROUP ====================
export const sysUserGroup = pgTable("sys_user_group", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id").notNull().references(() => sysGroup.id, { onDelete: "cascade" }),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSysUserGroupSchema = createInsertSchema(sysUserGroup).omit({
  id: true,
  createdAt: true,
});
export type InsertSysUserGroup = z.infer<typeof insertSysUserGroupSchema>;
export type SysUserGroup = typeof sysUserGroup.$inferSelect;

// ==================== SYS_RESOURCE ====================
export const sysResource = pgTable("sys_resource", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // menu, api, button
  path: varchar("path", { length: 255 }),
  method: varchar("method", { length: 10 }), // GET, POST, PUT, DELETE
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").default(0),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSysResourceSchema = createInsertSchema(sysResource).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSysResource = z.infer<typeof insertSysResourceSchema>;
export type SysResource = typeof sysResource.$inferSelect;

// ==================== SYS_PERMISSION ====================
export const sysPermission = pgTable("sys_permission", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => sysGroup.id, { onDelete: "cascade" }),
  resourceId: integer("resource_id").notNull().references(() => sysResource.id, { onDelete: "cascade" }),
  canAccess: boolean("can_access").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSysPermissionSchema = createInsertSchema(sysPermission).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSysPermission = z.infer<typeof insertSysPermissionSchema>;
export type SysPermission = typeof sysPermission.$inferSelect;
```

---

## API Endpoints

### 1. Quản lý nhóm người dùng (User Groups)

#### GET /api/user-groups
Lấy danh sách tất cả các nhóm người dùng.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Quản trị viên",
      "code": "ADMIN",
      "description": "Quản trị viên hệ thống",
      "status": "active",
      "isSystem": true,
      "userCount": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/user-groups/:id
Lấy thông tin chi tiết một nhóm.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Quản trị viên",
    "code": "ADMIN",
    "description": "Quản trị viên hệ thống",
    "status": "active",
    "isSystem": true,
    "users": [
      {
        "id": 1,
        "username": "admin",
        "fullName": "Administrator",
        "email": "admin@example.com"
      }
    ],
    "permissions": [1, 2, 3, 4]
  }
}
```

#### POST /api/user-groups
Tạo nhóm mới.

**Request:**
```json
{
  "name": "Quản lý hệ thống",
  "code": "SYSTEM_MANAGER",
  "description": "Quản lý cấu hình hệ thống",
  "status": "active"
}
```

#### PUT /api/user-groups/:id
Cập nhật thông tin nhóm.

#### DELETE /api/user-groups/:id
Xóa nhóm (không được xóa nhóm hệ thống).

#### POST /api/user-groups/:id/users
Thêm người dùng vào nhóm.

**Request:**
```json
{
  "userIds": [1, 2, 3]
}
```

#### DELETE /api/user-groups/:id/users/:userId
Xóa người dùng khỏi nhóm.

#### GET /api/user-groups/:id/users
Lấy danh sách người dùng trong nhóm.

---

### 2. Quản lý phân quyền (Permissions)

#### GET /api/permissions/resources
Lấy cây tài nguyên (menu, API) để phân quyền.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Quản trị hệ thống",
      "code": "ADMIN",
      "type": "menu",
      "path": "/admin",
      "children": [
        {
          "id": 2,
          "name": "Quản lý người dùng",
          "code": "ADMIN_USERS",
          "type": "menu",
          "path": "/admin/users",
          "children": [
            {
              "id": 3,
              "name": "Xem danh sách người dùng",
              "code": "ADMIN_USERS_VIEW",
              "type": "api",
              "path": "/api/users",
              "method": "GET"
            }
          ]
        }
      ]
    }
  ]
}
```

#### GET /api/permissions/groups/:groupId
Lấy danh sách quyền của nhóm.

**Response:**
```json
{
  "success": true,
  "data": {
    "groupId": 1,
    "groupName": "Quản trị viên",
    "permissions": [
      {
        "resourceId": 1,
        "resourceCode": "ADMIN",
        "resourceName": "Quản trị hệ thống",
        "canAccess": true
      }
    ]
  }
}
```

#### PUT /api/permissions/groups/:groupId
Cập nhật quyền cho nhóm.

**Request:**
```json
{
  "resourceIds": [1, 2, 3, 4, 5]
}
```

#### GET /api/permissions/users/:userId
Lấy tất cả quyền của người dùng (từ các nhóm).

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "admin",
    "groups": ["ADMIN", "SYSTEM_MANAGER"],
    "permissions": {
      "menus": ["/admin", "/admin/users", "/admin/user-groups"],
      "apis": [
        { "path": "/api/users", "method": "GET" },
        { "path": "/api/users", "method": "POST" }
      ]
    }
  }
}
```

---

## Triển khai Backend

### 1. Storage Layer

Thêm vào file `server/storage.ts`:

```typescript
import { db } from "./db";
import {
  sysGroup,
  sysUserGroup,
  sysResource,
  sysPermission,
  type InsertSysGroup,
  type InsertSysUserGroup,
  type InsertSysResource,
  type InsertSysPermission,
} from "@shared/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";

// ==================== SYS_GROUP ====================
export async function getUserGroups() {
  const groups = await db.select().from(sysGroup).orderBy(sysGroup.name);

  // Đếm số người dùng trong mỗi nhóm
  const groupsWithCount = await Promise.all(
    groups.map(async (group) => {
      const userCount = await db
        .select()
        .from(sysUserGroup)
        .where(eq(sysUserGroup.groupId, group.id));

      return {
        ...group,
        userCount: userCount.length,
      };
    })
  );

  return groupsWithCount;
}

export async function getUserGroupById(id: number) {
  const [group] = await db
    .select()
    .from(sysGroup)
    .where(eq(sysGroup.id, id))
    .limit(1);

  if (!group) return null;

  // Lấy danh sách người dùng trong nhóm
  const userGroups = await db
    .select()
    .from(sysUserGroup)
    .where(eq(sysUserGroup.groupId, id));

  // Lấy danh sách quyền của nhóm
  const permissions = await db
    .select()
    .from(sysPermission)
    .where(eq(sysPermission.groupId, id));

  return {
    ...group,
    userIds: userGroups.map(ug => ug.userId),
    resourceIds: permissions.map(p => p.resourceId),
  };
}

export async function createUserGroup(data: InsertSysGroup) {
  const [group] = await db.insert(sysGroup).values(data).returning();
  return group;
}

export async function updateUserGroup(id: number, data: Partial<InsertSysGroup>) {
  // Không cho phép cập nhật nhóm hệ thống
  const [existing] = await db
    .select()
    .from(sysGroup)
    .where(eq(sysGroup.id, id))
    .limit(1);

  if (!existing) return null;
  if (existing.isSystem) {
    throw new Error("Không thể cập nhật nhóm hệ thống");
  }

  const [group] = await db
    .update(sysGroup)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sysGroup.id, id))
    .returning();

  return group;
}

export async function deleteUserGroup(id: number) {
  // Không cho phép xóa nhóm hệ thống
  const [existing] = await db
    .select()
    .from(sysGroup)
    .where(eq(sysGroup.id, id))
    .limit(1);

  if (!existing) return false;
  if (existing.isSystem) {
    throw new Error("Không thể xóa nhóm hệ thống");
  }

  await db.delete(sysGroup).where(eq(sysGroup.id, id));
  return true;
}

// ==================== SYS_USER_GROUP ====================
export async function addUsersToGroup(groupId: number, userIds: number[]) {
  const values = userIds.map(userId => ({
    userId,
    groupId,
  }));

  // Sử dụng onConflictDoNothing để tránh lỗi duplicate
  await db
    .insert(sysUserGroup)
    .values(values)
    .onConflictDoNothing();

  return true;
}

export async function removeUserFromGroup(groupId: number, userId: number) {
  await db
    .delete(sysUserGroup)
    .where(
      and(
        eq(sysUserGroup.groupId, groupId),
        eq(sysUserGroup.userId, userId)
      )
    );

  return true;
}

export async function getUsersByGroupId(groupId: number) {
  // Giả sử bạn có bảng sys_user
  // Cần join với bảng sys_user để lấy thông tin đầy đủ
  const userGroups = await db
    .select()
    .from(sysUserGroup)
    .where(eq(sysUserGroup.groupId, groupId));

  return userGroups.map(ug => ug.userId);
}

export async function getGroupsByUserId(userId: number) {
  const userGroups = await db
    .select({
      group: sysGroup,
    })
    .from(sysUserGroup)
    .innerJoin(sysGroup, eq(sysUserGroup.groupId, sysGroup.id))
    .where(eq(sysUserGroup.userId, userId));

  return userGroups.map(ug => ug.group);
}

// ==================== SYS_RESOURCE ====================
export async function getResources() {
  return await db
    .select()
    .from(sysResource)
    .orderBy(sysResource.sortOrder);
}

export async function getResourceTree() {
  const resources = await db
    .select()
    .from(sysResource)
    .orderBy(sysResource.sortOrder);

  // Tạo cây phân quyền
  const rootResources = resources.filter(r => !r.parentId);

  function buildTree(parentId: number | null): any[] {
    return resources
      .filter(r => r.parentId === parentId)
      .map(r => ({
        ...r,
        children: buildTree(r.id),
      }));
  }

  return rootResources.map(r => ({
    ...r,
    children: buildTree(r.id),
  }));
}

export async function createResource(data: InsertSysResource) {
  const [resource] = await db.insert(sysResource).values(data).returning();
  return resource;
}

// ==================== SYS_PERMISSION ====================
export async function getPermissionsByGroupId(groupId: number) {
  return await db
    .select({
      permission: sysPermission,
      resource: sysResource,
    })
    .from(sysPermission)
    .innerJoin(sysResource, eq(sysPermission.resourceId, sysResource.id))
    .where(eq(sysPermission.groupId, groupId));
}

export async function updateGroupPermissions(groupId: number, resourceIds: number[]) {
  // Xóa tất cả quyền cũ
  await db.delete(sysPermission).where(eq(sysPermission.groupId, groupId));

  // Thêm quyền mới
  if (resourceIds.length > 0) {
    const values = resourceIds.map(resourceId => ({
      groupId,
      resourceId,
      canAccess: true,
    }));

    await db.insert(sysPermission).values(values);
  }

  return true;
}

export async function getUserPermissions(userId: number) {
  // Lấy tất cả nhóm của user
  const userGroups = await getGroupsByUserId(userId);
  const groupIds = userGroups.map(g => g.id);

  if (groupIds.length === 0) {
    return { menus: [], apis: [] };
  }

  // Lấy tất cả quyền từ các nhóm
  const permissions = await db
    .select({
      resource: sysResource,
    })
    .from(sysPermission)
    .innerJoin(sysResource, eq(sysPermission.resourceId, sysResource.id))
    .where(
      and(
        inArray(sysPermission.groupId, groupIds),
        eq(sysPermission.canAccess, true),
        eq(sysResource.status, "active")
      )
    );

  const menus = permissions
    .filter(p => p.resource.type === "menu")
    .map(p => p.resource.path)
    .filter(Boolean) as string[];

  const apis = permissions
    .filter(p => p.resource.type === "api")
    .map(p => ({
      path: p.resource.path,
      method: p.resource.method,
    }))
    .filter(api => api.path && api.method);

  return {
    groups: userGroups.map(g => g.code),
    menus: [...new Set(menus)],
    apis,
  };
}

// ==================== CHECK PERMISSION ====================
export async function checkUserPermission(
  userId: number,
  path: string,
  method?: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);

  if (!method) {
    // Kiểm tra quyền menu
    return permissions.menus.some(menu => path.startsWith(menu));
  }

  // Kiểm tra quyền API
  return permissions.apis.some(api => {
    // Hỗ trợ path params (/:id)
    const apiPathPattern = api.path?.replace(/:\w+/g, "[^/]+");
    const regex = new RegExp(`^${apiPathPattern}$`);
    return regex.test(path) && api.method?.toUpperCase() === method.toUpperCase();
  });
}
```

### 2. Routes Layer

Thêm vào file `server/routes.ts`:

```typescript
import { checkUserPermission } from "./storage";

// Middleware kiểm tra quyền
async function checkPermission(req: any, res: any, next: any) {
  // Giả sử bạn lưu userId trong session/token
  const userId = req.user?.id || req.session?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const hasPermission = await checkUserPermission(
    userId,
    req.path,
    req.method
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Forbidden: Bạn không có quyền truy cập" });
  }

  next();
}

export async function registerRoutes(app: Express) {
  // ... existing routes ...

  // ==================== USER GROUPS ====================
  app.get("/api/user-groups", checkPermission, async (req, res) => {
    try {
      const groups = await storage.getUserGroups();
      res.json({ success: true, data: groups });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/user-groups/:id", checkPermission, async (req, res) => {
    try {
      const group = await storage.getUserGroupById(parseInt(req.params.id));
      if (!group) {
        return res.status(404).json({ success: false, error: "Group not found" });
      }
      res.json({ success: true, data: group });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/user-groups", checkPermission, async (req, res) => {
    try {
      const data = insertSysGroupSchema.parse(req.body);
      const group = await storage.createUserGroup(data);
      res.status(201).json({ success: true, data: group });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.put("/api/user-groups/:id", checkPermission, async (req, res) => {
    try {
      const group = await storage.updateUserGroup(
        parseInt(req.params.id),
        req.body
      );
      if (!group) {
        return res.status(404).json({ success: false, error: "Group not found" });
      }
      res.json({ success: true, data: group });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/user-groups/:id", checkPermission, async (req, res) => {
    try {
      const deleted = await storage.deleteUserGroup(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Group not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.post("/api/user-groups/:id/users", checkPermission, async (req, res) => {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          error: "userIds must be an array"
        });
      }

      await storage.addUsersToGroup(parseInt(req.params.id), userIds);
      res.json({ success: true, message: "Users added to group" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/user-groups/:id/users/:userId", checkPermission, async (req, res) => {
    try {
      await storage.removeUserFromGroup(
        parseInt(req.params.id),
        parseInt(req.params.userId)
      );
      res.json({ success: true, message: "User removed from group" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get("/api/user-groups/:id/users", checkPermission, async (req, res) => {
    try {
      const userIds = await storage.getUsersByGroupId(parseInt(req.params.id));
      res.json({ success: true, data: userIds });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== PERMISSIONS ====================
  app.get("/api/permissions/resources", checkPermission, async (req, res) => {
    try {
      const tree = await storage.getResourceTree();
      res.json({ success: true, data: tree });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/permissions/groups/:groupId", checkPermission, async (req, res) => {
    try {
      const permissions = await storage.getPermissionsByGroupId(
        parseInt(req.params.groupId)
      );
      res.json({ success: true, data: permissions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/permissions/groups/:groupId", checkPermission, async (req, res) => {
    try {
      const { resourceIds } = req.body;
      if (!Array.isArray(resourceIds)) {
        return res.status(400).json({
          success: false,
          error: "resourceIds must be an array"
        });
      }

      await storage.updateGroupPermissions(
        parseInt(req.params.groupId),
        resourceIds
      );
      res.json({ success: true, message: "Permissions updated" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get("/api/permissions/users/:userId", checkPermission, async (req, res) => {
    try {
      const permissions = await storage.getUserPermissions(
        parseInt(req.params.userId)
      );
      res.json({ success: true, data: permissions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return app;
}
```

---

## Ví dụ sử dụng

### 1. Tạo nhóm mới

```bash
curl -X POST http://localhost:3000/api/user-groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quản lý báo cáo",
    "code": "REPORT_MANAGER",
    "description": "Có quyền xem và quản lý báo cáo",
    "status": "active"
  }'
```

### 2. Thêm người dùng vào nhóm

```bash
curl -X POST http://localhost:3000/api/user-groups/1/users \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [1, 2, 3]
  }'
```

### 3. Phân quyền cho nhóm

```bash
curl -X PUT http://localhost:3000/api/permissions/groups/1 \
  -H "Content-Type: application/json" \
  -d '{
    "resourceIds": [1, 2, 3, 4, 5]
  }'
```

### 4. Kiểm tra quyền của user

```bash
curl http://localhost:3000/api/permissions/users/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": ["ADMIN"],
    "menus": ["/admin", "/admin/users", "/admin/user-groups"],
    "apis": [
      { "path": "/api/users", "method": "GET" },
      { "path": "/api/users", "method": "POST" }
    ]
  }
}
```

---

## Seed Data

Tạo file `server/seedPermissions.ts`:

```typescript
import { db } from "./db";
import { sysGroup, sysResource, sysPermission } from "@shared/schema";

export async function seedPermissions() {
  console.log("🌱 Seeding permissions...");

  // 1. Tạo nhóm hệ thống
  const adminGroup = await db.insert(sysGroup).values({
    name: "Quản trị viên",
    code: "ADMIN",
    description: "Quản trị viên hệ thống, có toàn quyền",
    isSystem: true,
  }).returning();

  const userGroup = await db.insert(sysGroup).values({
    name: "Người dùng",
    code: "USER",
    description: "Người dùng thông thường",
    isSystem: true,
  }).returning();

  // 2. Tạo resources (đã có SQL ở trên)
  // ... (thực hiện insert resources)

  // 3. Gán toàn bộ quyền cho ADMIN
  const allResources = await db.select().from(sysResource);
  const adminPermissions = allResources.map(resource => ({
    groupId: adminGroup[0].id,
    resourceId: resource.id,
    canAccess: true,
  }));

  await db.insert(sysPermission).values(adminPermissions);

  console.log("✅ Permissions seeded successfully!");
}
```

Chạy seed:
```typescript
// server/seed.ts
import { seedPermissions } from "./seedPermissions";

await seedPermissions();
```

---

## Lưu ý bảo mật

1. **Không bao giờ tin tưởng client**: Luôn kiểm tra quyền ở backend
2. **Mã hóa session/token**: Sử dụng JWT hoặc session để lưu userId
3. **Rate limiting**: Giới hạn số request để tránh brute force
4. **Audit log**: Ghi lại mọi thay đổi về quyền
5. **Validation**: Kiểm tra đầu vào nghiêm ngặt

---

## Migration

Tạo file migration để áp dụng các thay đổi:

```bash
# Nếu dùng Drizzle Kit
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

---

## Tổng kết

Hệ thống phân quyền này cung cấp:

- ✅ Quản lý nhóm người dùng linh hoạt
- ✅ Phân quyền chi tiết đến từng API endpoint
- ✅ Hỗ trợ cây phân quyền (menu cha - con)
- ✅ Middleware tự động kiểm tra quyền
- ✅ Dễ dàng mở rộng và bảo trì

Chúc bạn triển khai thành công! 🎉
