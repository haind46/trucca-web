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

  // Contacts
  CONTACTS: {
    LIST: `${API_BASE}/contacts`,
    DETAIL: (id: number | string) => `${API_BASE}/contacts/${id}`,
    CREATE: `${API_BASE}/contacts`,
    DELETE: (id: number | string) => `${API_BASE}/contacts/${id}`,
  },

  // Groups
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
