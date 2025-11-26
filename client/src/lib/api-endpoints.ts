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

  // Systems
  SYSTEMS: {
    LIST: `${API_BASE}/systems`,
    DETAIL: (id: number | string) => `${API_BASE}/systems/${id}`,
    CREATE: `${API_BASE}/systems`,
    UPDATE: (id: number | string) => `${API_BASE}/systems/${id}`,
    DELETE: (id: number | string) => `${API_BASE}/systems/${id}`,
  },

  // Alerts
  ALERTS: {
    LIST: `${API_BASE}/alerts`,
    ACTIVE: `${API_BASE}/alerts/active`,
    DETAIL: (id: number | string) => `${API_BASE}/alerts/${id}`,
    ACKNOWLEDGE: (id: number | string) => `${API_BASE}/alerts/${id}/acknowledge`,
  },

  // Contacts (Thông tin liên hệ)
  CONTACTS: {
    LIST: `${API_BASE}/contacts`,
    FILTER: `${API_BASE}/contacts/filter`,
    DETAIL: (id: number | string) => `${API_BASE}/contacts/${id}`,
    CREATE: `${API_BASE}/contacts/create`,
    UPDATE: `${API_BASE}/contacts/edit`,
    DELETE: `${API_BASE}/contacts/delete`,
    COPY: (id: number | string) => `${API_BASE}/contacts/copy/${id}`,
    EXPORT: `${API_BASE}/contacts/export`,
    IMPORT: `${API_BASE}/contacts/import`,
    TEMPLATE: `${API_BASE}/contacts/template`,
  },

  // Group Contacts (Nhóm liên hệ)
  GROUP_CONTACTS: {
    LIST: `${API_BASE}/group_contacts`,
    FILTER: `${API_BASE}/group_contacts/filter`,
    DETAIL: (id: number | string) => `${API_BASE}/group_contacts/${id}`,
    CREATE: `${API_BASE}/group_contacts/create`,
    UPDATE: `${API_BASE}/group_contacts/edit`,
    DELETE: `${API_BASE}/group_contacts/delete`,
    COPY: (id: number | string) => `${API_BASE}/group_contacts/copy/${id}`,
    EXPORT: `${API_BASE}/group_contacts/export`,
    IMPORT: `${API_BASE}/group_contacts/import`,
    TEMPLATE: `${API_BASE}/group_contacts/template`,
    // Contact members management
    CONTACTS: (groupId: number | string) => `${API_BASE}/group_contacts/${groupId}/contacts`,
    ADD_CONTACT: (groupId: number | string) => `${API_BASE}/group_contacts/${groupId}/contacts/add`,
    ADD_CONTACTS: (groupId: number | string) => `${API_BASE}/group_contacts/${groupId}/contacts/add-multiple`,
    REMOVE_CONTACT: (groupId: number | string) => `${API_BASE}/group_contacts/${groupId}/contacts/remove`,
    REMOVE_CONTACTS: (groupId: number | string) => `${API_BASE}/group_contacts/${groupId}/contacts/remove-multiple`,
    COUNT_CONTACTS: (groupId: number | string) => `${API_BASE}/group_contacts/${groupId}/contacts/count`,
  },

  // Groups (Alert notification groups)
  GROUPS: {
    LIST: `${API_BASE}/groups`,
    DETAIL: (id: number | string) => `${API_BASE}/groups/${id}`,
    CREATE: `${API_BASE}/groups`,
    DELETE: (id: number | string) => `${API_BASE}/groups/${id}`,
  },

  // Rules
  RULES: {
    LIST: `${API_BASE}/rules`,
    DETAIL: (id: number | string) => `${API_BASE}/rules/${id}`,
    CREATE: `${API_BASE}/rules`,
    DELETE: (id: number | string) => `${API_BASE}/rules/${id}`,
  },

  // Schedules
  SCHEDULES: {
    LIST: `${API_BASE}/schedules`,
    DETAIL: (id: number | string) => `${API_BASE}/schedules/${id}`,
    CREATE: `${API_BASE}/schedules`,
    DELETE: (id: number | string) => `${API_BASE}/schedules/${id}`,
  },

  // Incidents
  INCIDENTS: {
    LIST: `${API_BASE}/incidents`,
    DETAIL: (id: number | string) => `${API_BASE}/incidents/${id}`,
  },

  // Stats
  STATS: {
    OVERVIEW: `${API_BASE}/stats`,
  },

  // Users
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

  // System Groups
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

  // Roles
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

  // Resources/Permissions
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

  // Permissions
  PERMISSIONS: {
    RESOURCES: `${API_BASE}/permissions/resources`,
    GROUPS: `${API_BASE}/permissions/groups`,
  },

  // Alert Frequency
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

  // System Level
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

  // Operation Types
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

  // Departments
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

  // User Groups
  USER_GROUPS: {
    BY_GROUP: (groupId: number | string) => `${API_BASE}/user-groups/group/${groupId}`,
  },

  // Shifts (Ca trực)
  SHIFTS: {
    LIST: `${API_BASE}/shifts`,
    FILTER: `${API_BASE}/shifts/filter`,
    DETAIL: (id: number | string) => `${API_BASE}/shifts/${id}`,
    CREATE: `${API_BASE}/shifts/create`,
    UPDATE: `${API_BASE}/shifts/edit`,
    DELETE: (id: number | string) => `${API_BASE}/shifts/delete/${id}`,
    DELETE_MANY: `${API_BASE}/shifts/delete`,
    COPY: (id: number | string) => `${API_BASE}/shifts/copy/${id}`,
    EXPORT: `${API_BASE}/shifts/export`,
    IMPORT: `${API_BASE}/shifts/import`,
    TEMPLATE: `${API_BASE}/shifts/template`,
  },

  // Schedule (Lịch trực)
  SCHEDULE: {
    LIST: `${API_BASE}/schedule`,
    FILTER: `${API_BASE}/schedule/filter`,
    DETAIL: (id: number | string) => `${API_BASE}/schedule/${id}`,
    CREATE: `${API_BASE}/schedule/create`,
    UPDATE: `${API_BASE}/schedule/edit`,
    DELETE: (id: number | string) => `${API_BASE}/schedule/delete/${id}`,
    DELETE_MANY: `${API_BASE}/schedule/delete`,
    COPY: (id: number | string) => `${API_BASE}/schedule/copy/${id}`,
    EXPORT: `${API_BASE}/schedule/export`,
    IMPORT: `${API_BASE}/schedule/import`,
    TEMPLATE: `${API_BASE}/schedule/template`,
  },

  // Schedule Assignments (Phân công ca trực)
  SCHEDULE_ASSIGNMENTS: {
    LIST: `${API_BASE}/schedule_assignments`,
    FILTER: `${API_BASE}/schedule_assignments/filter`,
    DETAIL: (id: number | string) => `${API_BASE}/schedule_assignments/${id}`,
    CREATE: `${API_BASE}/schedule_assignments/create`,
    UPDATE: `${API_BASE}/schedule_assignments/edit`,
    DELETE: (id: number | string) => `${API_BASE}/schedule_assignments/delete/${id}`,
    DELETE_MANY: `${API_BASE}/schedule_assignments/delete`,
    COPY: (id: number | string) => `${API_BASE}/schedule_assignments/copy/${id}`,
    EXPORT: `${API_BASE}/schedule_assignments/export`,
    IMPORT: `${API_BASE}/schedule_assignments/import`,
    TEMPLATE: `${API_BASE}/schedule_assignments/template`,
  },

  // Sys Severity (Mức độ cảnh báo)
  SYS_SEVERITY: {
    LIST: `${API_BASE}/sys-severity`,
    DETAIL: (code: string) => `${API_BASE}/sys-severity/${code}`,
    ACTIVE: `${API_BASE}/sys-severity/active`,
    CREATE: `${API_BASE}/sys-severity/create`,
    UPDATE: `${API_BASE}/sys-severity/edit`,
    DELETE: `${API_BASE}/sys-severity/delete`,
    COPY: `${API_BASE}/sys-severity/copy`,
    EXPORT: `${API_BASE}/sys-severity/export`,
    IMPORT: `${API_BASE}/sys-severity/import`,
    TEMPLATE: `${API_BASE}/sys-severity/template`,
  },

  // System Catalog (Danh sách Hệ thống)
  SYSTEM_CATALOG: {
    LIST: `${API_BASE}/system-catalog`,
    DETAIL: (code: string) => `${API_BASE}/system-catalog/${code}`,
    ACTIVE: `${API_BASE}/system-catalog/active`,
    CREATE: `${API_BASE}/system-catalog/create`,
    UPDATE: `${API_BASE}/system-catalog/edit`,
    DELETE: `${API_BASE}/system-catalog/delete`,
    COPY: `${API_BASE}/system-catalog/copy`,
    EXPORT: `${API_BASE}/system-catalog/export`,
    IMPORT: `${API_BASE}/system-catalog/import`,
    TEMPLATE: `${API_BASE}/system-catalog/template`,
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
