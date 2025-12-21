import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import type { ErrorDictionary, ErrorDictionaryFormData } from "@/types/error-dictionary";

export const errorDictionaryService = {
  // Get all error dictionaries with pagination
  async getAll(page: number = 1, limit: number = 10, keyword?: string) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort_dir: "desc",
      sort_key: "id",
    });
    if (keyword) params.append("keyword", keyword);

    const response = await fetchWithAuth(`${API_ENDPOINTS.ERROR_DICTIONARY.LIST}?${params}`);
    return response.json();
  },

  // Get error dictionary by ID
  async getById(id: number | string) {
    const response = await fetchWithAuth(API_ENDPOINTS.ERROR_DICTIONARY.DETAIL(id));
    return response.json();
  },

  // Get error dictionary by error code
  async getByCode(errorCode: string) {
    const response = await fetchWithAuth(API_ENDPOINTS.ERROR_DICTIONARY.BY_CODE(errorCode));
    return response.json();
  },

  // Create new error dictionary
  async create(data: ErrorDictionaryFormData) {
    const response = await fetchWithAuth(API_ENDPOINTS.ERROR_DICTIONARY.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update error dictionary
  async update(id: number | string, data: ErrorDictionaryFormData) {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ERROR_DICTIONARY.UPDATE}?id=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete error dictionary
  async delete(id: number | string) {
    const response = await fetchWithAuth(API_ENDPOINTS.ERROR_DICTIONARY.DELETE(id), {
      method: "DELETE",
    });
    return response.json();
  },

  // Delete multiple error dictionaries
  async deleteMany(ids: number[]) {
    const params = ids.map((id) => `ids=${id}`).join("&");
    const response = await fetchWithAuth(`${API_ENDPOINTS.ERROR_DICTIONARY.DELETE_MANY}?${params}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Copy error dictionary
  async copy(id: number | string) {
    const response = await fetchWithAuth(`${API_ENDPOINTS.ERROR_DICTIONARY.COPY}?id=${id}`, {
      method: "POST",
    });
    return response.json();
  },

  // Export to Excel
  async export() {
    const response = await fetchWithAuth(API_ENDPOINTS.ERROR_DICTIONARY.EXPORT);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error_dictionary_export_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Import from Excel
  async import(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithAuth(API_ENDPOINTS.ERROR_DICTIONARY.IMPORT, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  // Download template
  async downloadTemplate() {
    const response = await fetchWithAuth(API_ENDPOINTS.ERROR_DICTIONARY.TEMPLATE);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "error_dictionary_template.xlsx";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
