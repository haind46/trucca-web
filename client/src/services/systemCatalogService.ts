/**
 * SystemCatalog Service
 * Service layer for handling System Catalog API calls
 */

import { fetchWithAuth } from '@/lib/api';
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-endpoints';
import {
  SystemCatalog,
  SystemCatalogCreateRequest,
  SystemCatalogUpdateRequest,
  SystemCatalogApiResponse,
  PaginatedSystemCatalogs,
  SystemCatalogQueryParams,
} from '@/types/system-catalog';

export const systemCatalogService = {
  /**
   * Get list of system catalogs with pagination
   */
  getAll: async (params: SystemCatalogQueryParams = {}): Promise<SystemCatalogApiResponse<PaginatedSystemCatalogs>> => {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sort_dir: params.sort_dir || 'asc',
      sort_key: params.sort_key || 'name',
      ...(params.keyword && { keyword: params.keyword }),
    };

    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYSTEM_CATALOG.LIST, queryParams));

    if (!response.ok) {
      throw new Error('Failed to fetch system catalogs');
    }

    return response.json();
  },

  /**
   * Get active system catalogs
   */
  getActive: async (): Promise<SystemCatalogApiResponse<SystemCatalog[]>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYSTEM_CATALOG.ACTIVE);

    if (!response.ok) {
      throw new Error('Failed to fetch active system catalogs');
    }

    return response.json();
  },

  /**
   * Get system catalog by code
   */
  getByCode: async (code: string): Promise<SystemCatalogApiResponse<SystemCatalog>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYSTEM_CATALOG.DETAIL(code));

    if (!response.ok) {
      throw new Error(`Failed to fetch system catalog with code: ${code}`);
    }

    return response.json();
  },

  /**
   * Create new system catalog
   */
  create: async (data: SystemCatalogCreateRequest): Promise<SystemCatalogApiResponse<SystemCatalog>> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYSTEM_CATALOG.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create system catalog');
    }

    return result;
  },

  /**
   * Update system catalog
   */
  update: async (id: string, data: SystemCatalogUpdateRequest): Promise<SystemCatalogApiResponse<SystemCatalog>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYSTEM_CATALOG.UPDATE, { id }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update system catalog');
    }

    return result;
  },

  /**
   * Delete system catalog (single or multiple)
   */
  delete: async (ids: string[]): Promise<SystemCatalogApiResponse<null>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYSTEM_CATALOG.DELETE, { ids: ids.join(',') }), {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete system catalog');
    }

    return result;
  },

  /**
   * Copy system catalog
   */
  copy: async (id: string): Promise<SystemCatalogApiResponse<SystemCatalog>> => {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.SYSTEM_CATALOG.COPY, { id }), {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to copy system catalog');
    }

    return result;
  },

  /**
   * Export to Excel
   */
  exportToExcel: async (): Promise<Blob> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYSTEM_CATALOG.EXPORT);

    if (!response.ok) {
      throw new Error('Failed to export system catalogs');
    }

    return response.blob();
  },

  /**
   * Import from Excel
   */
  importFromExcel: async (file: File): Promise<SystemCatalogApiResponse<SystemCatalog[]>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth(API_ENDPOINTS.SYSTEM_CATALOG.IMPORT, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to import system catalogs');
    }

    return result;
  },

  /**
   * Download template Excel file
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SYSTEM_CATALOG.TEMPLATE);

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    return response.blob();
  },
};
