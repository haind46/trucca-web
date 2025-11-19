// Department Service - API integration for Department Management
// Based on API_Department.md v2.0

import { fetchWithAuth } from '@/lib/api';
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';
import type {
  Department,
  DepartmentRequest,
  DepartmentApiResponse,
  PaginatedDepartments,
  DepartmentQueryParams,
} from '@/types/department';

export const departmentService = {
  /**
   * Get all departments with pagination and filtering
   */
  getAll: async (params?: DepartmentQueryParams): Promise<DepartmentApiResponse<PaginatedDepartments>> => {
    const url = params ? getApiUrl(API_ENDPOINTS.DEPARTMENTS.LIST, params as any) : API_ENDPOINTS.DEPARTMENTS.LIST;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Create a new department
   */
  create: async (data: DepartmentRequest): Promise<DepartmentApiResponse<Department>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.DEPARTMENTS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create department');
    }

    return response.json();
  },

  /**
   * Update an existing department
   */
  update: async (id: number, data: Partial<DepartmentRequest>): Promise<DepartmentApiResponse<Department>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.DEPARTMENTS.UPDATE, { id }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update department');
    }

    return response.json();
  },

  /**
   * Delete one or more departments
   */
  delete: async (ids: number[]): Promise<DepartmentApiResponse<null>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.DEPARTMENTS.DELETE, { ids: ids.join(',') }), {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete department(s)');
    }

    return response.json();
  },

  /**
   * Export departments to Excel
   */
  exportToExcel: async (params?: DepartmentQueryParams): Promise<Blob> => {
    const url = params ? getApiUrl(API_ENDPOINTS.DEPARTMENTS.EXPORT, params as any) : API_ENDPOINTS.DEPARTMENTS.EXPORT;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error('Failed to export departments');
    }

    return response.blob();
  },

  /**
   * Import departments from Excel file
   */
  importFromExcel: async (file: File): Promise<DepartmentApiResponse<null>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth(API_ENDPOINTS.DEPARTMENTS.IMPORT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to import departments');
    }

    return response.json();
  },

  /**
   * Download import template Excel file
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await fetchWithAuth(API_ENDPOINTS.DEPARTMENTS.IMPORT_TEMPLATE);

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    return response.blob();
  },
};
