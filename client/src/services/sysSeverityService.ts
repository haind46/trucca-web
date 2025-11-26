/**
 * SysSeverity Service (Simplified Version)
 * Service layer for handling Severity API calls
 */

import { fetchWithAuth } from '@/lib/api';
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';
import {
  SysSeverity,
  SysSeverityRequest,
  PaginatedResponse,
  ApiResponse,
  SeverityListParams,
} from '@/types/sys-severity';

export const sysSeverityService = {
  /**
   * Get list of severities with pagination
   */
  getAll: async (params: SeverityListParams = {}): Promise<PaginatedResponse<SysSeverity>> => {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sort_dir: params.sort_dir || 'desc',
      sort_key: params.sort_key || 'priorityLevel',
      ...(params.keyword && { keyword: params.keyword }),
    };

    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYS_SEVERITY.LIST, queryParams));

    if (!response.ok) {
      throw new Error('Failed to fetch severities');
    }

    return response.json();
  },

  /**
   * Get active severities
   */
  getActive: async (): Promise<ApiResponse<SysSeverity[]>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYS_SEVERITY.ACTIVE);

    if (!response.ok) {
      throw new Error('Failed to fetch active severities');
    }

    return response.json();
  },

  /**
   * Get severity by code
   */
  getByCode: async (code: string): Promise<ApiResponse<SysSeverity>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYS_SEVERITY.DETAIL(code));

    if (!response.ok) {
      throw new Error(`Failed to fetch severity with code: ${code}`);
    }

    return response.json();
  },

  /**
   * Create new severity
   */
  create: async (data: SysSeverityRequest): Promise<ApiResponse<SysSeverity>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYS_SEVERITY.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create severity');
    }

    return result;
  },

  /**
   * Update severity
   */
  update: async (id: string, data: Partial<SysSeverityRequest>): Promise<ApiResponse<SysSeverity>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYS_SEVERITY.UPDATE, { id }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update severity');
    }

    return result;
  },

  /**
   * Delete severity (single or multiple)
   */
  delete: async (ids: string[]): Promise<ApiResponse<null>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYS_SEVERITY.DELETE, { ids: ids.join(',') }), {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete severity');
    }

    return result;
  },

  /**
   * Copy severity
   */
  copy: async (id: string): Promise<ApiResponse<SysSeverity>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYS_SEVERITY.COPY, { id }), {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to copy severity');
    }

    return result;
  },

  /**
   * Export to Excel
   */
  exportToExcel: async (): Promise<Blob> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYS_SEVERITY.EXPORT);

    if (!response.ok) {
      throw new Error('Failed to export severities');
    }

    return response.blob();
  },

  /**
   * Import from Excel
   */
  importFromExcel: async (file: File): Promise<ApiResponse<SysSeverity[]>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth(API_ENDPOINTS.SYS_SEVERITY.IMPORT, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to import severities');
    }

    return result;
  },

  /**
   * Download template Excel file
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYS_SEVERITY.TEMPLATE);

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    return response.blob();
  },
};
