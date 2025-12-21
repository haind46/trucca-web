/**
 * SystemCatalog Types & Interfaces
 * Quản lý Danh sách Hệ thống
 */

/**
 * System Level Object (nested in SystemCatalog)
 */
export interface SystemLevel {
  id: number;
  level: string;
  description?: string;
}

/**
 * System Catalog Object
 */
export interface SystemCatalog {
  id: string;
  code: string;                    // Mã hệ thống (UNIQUE, required)
  name: string;                    // Tên hệ thống (required)
  echatId?: string;                // EChat ID
  ipAddress?: string;              // Địa chỉ IP
  polestarCode?: string;           // Mã Polestar
  systemLevelId?: number;          // ID cấp độ hệ thống
  systemLevel?: SystemLevel;       // Thông tin cấp độ (nested object)
  description?: string;            // Mô tả
  isActive: boolean;               // Trạng thái
  createdAt: string;               // ISO 8601
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Request DTO cho Create
 */
export interface SystemCatalogCreateRequest {
  code: string;
  name: string;
  echatId?: string;
  ipAddress?: string;
  polestarCode?: string;
  systemLevelId?: number;
  description?: string;
  isActive?: boolean;
  createdBy?: string;
  contactIds?: number[];           // Danh sách ID liên hệ
  groupContactIds?: number[];      // Danh sách ID nhóm liên hệ
}

/**
 * Request DTO cho Update
 */
export interface SystemCatalogUpdateRequest {
  code?: string;
  name?: string;
  echatId?: string;
  ipAddress?: string;
  polestarCode?: string;
  systemLevelId?: number;
  description?: string;
  isActive?: boolean;
  updatedBy?: string;
  contactIds?: number[];
  groupContactIds?: number[];
}

/**
 * Form Data for Create/Edit Dialog
 */
export interface SystemCatalogFormData {
  code: string;
  name: string;
  echatId: string;
  ipAddress: string;
  polestarCode: string;
  systemLevelId: number | null;
  description: string;
  isActive: boolean;
}

/**
 * Paginated Response (New structure - API trả về data.data, data.total, data.page, data.size)
 */
export interface PaginatedSystemCatalogs {
  data: SystemCatalog[];
  total: number;
  page: number;              // 0-indexed from API
  size: number;
}

/**
 * API Response
 */
export interface SystemCatalogApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

/**
 * List Query Parameters
 */
export interface SystemCatalogQueryParams {
  page?: number;                   // 1-indexed
  limit?: number;
  keyword?: string;                // Tìm kiếm
  sort_dir?: 'asc' | 'desc';
  sort_key?: string;               // code, name, createdAt, etc. (camelCase)
}

/**
 * Contact Assignment Interfaces
 */
export interface Contact {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  departmentId?: number;
  isActive: boolean;
}

export interface SystemCatalogContact {
  id: string;
  systemCatalogId: string;
  contactId: number;
  contact: Contact;
  createdAt: string;
  createdBy?: string;
}

/**
 * Group Contact Assignment Interfaces
 */
export interface GroupContact {
  id: number;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface SystemCatalogGroupContact {
  id: string;
  systemCatalogId: string;
  groupContactId: number;
  groupContact: GroupContact;
  createdAt: string;
  createdBy?: string;
}
