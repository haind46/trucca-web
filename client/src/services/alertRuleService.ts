/**
 * Alert Rule Service
 * Service layer for handling Alert Rule API calls
 */

import { fetchWithAuth } from '@/lib/api';
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';
import type {
  AlertRule,
  AlertRuleFormData,
  AlertRuleRole,
  AlertRuleContact,
  AlertRuleGroupContact,
  PaginatedAlertRules,
  ApiResponse,
} from '@/types/alert-rule';

export const alertRuleService = {
  /**
   * Get list of alert rules with pagination
   */
  getAll: async (page = 1, limit = 10, keyword = ''): Promise<ApiResponse<PaginatedAlertRules>> => {
    const params = {
      page,
      limit,
      sort_dir: 'desc',
      sort_key: 'code',
      ...(keyword && { keyword }),
    };

    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.ALERT_RULE.LIST, params));

    if (!response.ok) {
      throw new Error('Failed to fetch alert rules');
    }

    return response.json();
  },

  /**
   * Get alert rule by ID
   */
  getById: async (id: number): Promise<ApiResponse<AlertRule>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.DETAIL(id));

    if (!response.ok) {
      throw new Error(`Failed to fetch alert rule with ID: ${id}`);
    }

    return response.json();
  },

  /**
   * Create new alert rule
   */
  create: async (data: AlertRuleFormData): Promise<ApiResponse<AlertRule>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create alert rule');
    }

    return result;
  },

  /**
   * Update alert rule
   */
  update: async (id: number, data: Partial<AlertRuleFormData>): Promise<ApiResponse<AlertRule>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.ALERT_RULE.UPDATE, { id }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update alert rule');
    }

    return result;
  },

  /**
   * Delete alert rule(s)
   */
  delete: async (ids: number[]): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.ALERT_RULE.DELETE, { ids: ids.join(',') }), {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete alert rule');
    }

    return result;
  },

  /**
   * Copy alert rule
   */
  copy: async (id: number): Promise<ApiResponse<AlertRule>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.ALERT_RULE.COPY, { id }), {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to copy alert rule');
    }

    return result;
  },

  /**
   * Export to Excel
   */
  export: async (): Promise<void> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.EXPORT);

    if (!response.ok) {
      throw new Error('Failed to export alert rules');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alert_rules_export.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Import from Excel
   */
  import: async (file: File): Promise<ApiResponse<AlertRule[]>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.IMPORT, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to import alert rules');
    }

    return result;
  },

  /**
   * Download template Excel file
   */
  downloadTemplate: async (): Promise<void> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.TEMPLATE);

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alert_rules_template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // === ROLES MANAGEMENT ===

  /**
   * Get assigned roles
   */
  getRoles: async (alertRuleId: number): Promise<ApiResponse<AlertRuleRole[]>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.ROLES(alertRuleId));

    if (!response.ok) {
      throw new Error('Failed to fetch assigned roles');
    }

    return response.json();
  },

  /**
   * Assign roles to alert rule
   */
  assignRoles: async (alertRuleId: number, roleIds: number[], createdBy: string): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.ASSIGN_ROLES(alertRuleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIds, createdBy }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to assign roles');
    }

    return result;
  },

  /**
   * Unassign roles from alert rule
   */
  unassignRoles: async (alertRuleId: number, roleIds: number[]): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.UNASSIGN_ROLES(alertRuleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIds }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to unassign roles');
    }

    return result;
  },

  // === CONTACTS MANAGEMENT ===

  /**
   * Get assigned contacts
   */
  getContacts: async (alertRuleId: number): Promise<ApiResponse<AlertRuleContact[]>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.CONTACTS(alertRuleId));

    if (!response.ok) {
      throw new Error('Failed to fetch assigned contacts');
    }

    return response.json();
  },

  /**
   * Assign contacts to alert rule
   */
  assignContacts: async (alertRuleId: number, contactIds: number[], createdBy: string): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.ASSIGN_CONTACTS(alertRuleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactIds, createdBy }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to assign contacts');
    }

    return result;
  },

  /**
   * Unassign contacts from alert rule
   */
  unassignContacts: async (alertRuleId: number, contactIds: number[]): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.UNASSIGN_CONTACTS(alertRuleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactIds }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to unassign contacts');
    }

    return result;
  },

  // === GROUP CONTACTS MANAGEMENT ===

  /**
   * Get assigned group contacts
   */
  getGroupContacts: async (alertRuleId: number): Promise<ApiResponse<AlertRuleGroupContact[]>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.GROUP_CONTACTS(alertRuleId));

    if (!response.ok) {
      throw new Error('Failed to fetch assigned group contacts');
    }

    return response.json();
  },

  /**
   * Assign group contacts to alert rule
   */
  assignGroupContacts: async (alertRuleId: number, groupContactIds: number[], createdBy: string): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.ASSIGN_GROUP_CONTACTS(alertRuleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupContactIds, createdBy }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to assign group contacts');
    }

    return result;
  },

  /**
   * Unassign group contacts from alert rule
   */
  unassignGroupContacts: async (alertRuleId: number, groupContactIds: number[]): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ALERT_RULE.UNASSIGN_GROUP_CONTACTS(alertRuleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupContactIds }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to unassign group contacts');
    }

    return result;
  },
};
