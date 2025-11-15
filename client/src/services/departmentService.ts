// Department Service - API integration for Department Management
// Based on API_Department.md v2.0

import { fetchWithAuth } from '@/lib/api';
import type {
  Department,
  DepartmentRequest,
  DepartmentApiResponse,
  PaginatedDepartments,
  DepartmentQueryParams,
} from '@/types/department';

const BASE_URL = 'http://localhost:8002/api/department';

export const departmentService = {
  /**
   * Get all departments with pagination and filtering
   */
  getAll: async (params?: DepartmentQueryParams): Promise<DepartmentApiResponse<PaginatedDepartments>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.keyWord) queryParams.append('keyWord', params.keyWord);
    if (params?.sort_dir) queryParams.append('sort_dir', params.sort_dir);
    if (params?.sort_key) queryParams.append('sort_key', params.sort_key);

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
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
    const response = await fetchWithAuth(`${BASE_URL}/create`, {
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
    const response = await fetchWithAuth(`${BASE_URL}/edit?id=${id}`, {
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
    const response = await fetchWithAuth(`${BASE_URL}/delete?ids=${ids.join(',')}`, {
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
    const queryParams = new URLSearchParams();

    if (params?.keyWord) queryParams.append('keyWord', params.keyWord);
    if (params?.sort_dir) queryParams.append('sort_dir', params.sort_dir);
    if (params?.sort_key) queryParams.append('sort_key', params.sort_key);

    const url = queryParams.toString()
      ? `${BASE_URL}/export?${queryParams}`
      : `${BASE_URL}/export`;

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

    const response = await fetchWithAuth(`${BASE_URL}/import`, {
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
    const response = await fetchWithAuth(`${BASE_URL}/import-template`);

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    return response.blob();
  },
};
