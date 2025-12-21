import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS, buildQueryString } from "@/lib/api-endpoints";
import type { LogEntryFilters } from "@/types/log-entry";

export const logEntryService = {
  // Get all log entries with pagination
  async getAll(page: number = 1, limit: number = 10, keyword?: string) {
    const params: Record<string, any> = {
      page,
      limit,
      sort_dir: "desc",
      sort_key: "occurred_at",
    };
    if (keyword) params.keyword = keyword;

    const response = await fetchWithAuth(`${API_ENDPOINTS.LOG_ENTRIES.LIST}${buildQueryString(params)}`);
    return response.json();
  },

  /**
   * Filter log entries - API đã được đơn giản hóa theo API_FILTER_REWRITE.md
   * Chỉ còn 7 filter parameters: keyword, severity, occurredAtFrom, occurredAtTo, systemName, sort_dir, sort_key
   */
  async filter(filters: LogEntryFilters) {
    const params: Record<string, any> = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      sort_dir: filters.sort_dir || "desc",
      sort_key: filters.sort_key || "occurred_at",
    };

    // Add optional filters (chỉ 5 filters chính theo API mới)
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.severity) params.severity = filters.severity;
    if (filters.occurredAtFrom) params.occurredAtFrom = filters.occurredAtFrom;
    if (filters.occurredAtTo) params.occurredAtTo = filters.occurredAtTo;
    if (filters.systemName) params.systemName = filters.systemName;

    const response = await fetchWithAuth(`${API_ENDPOINTS.LOG_ENTRIES.FILTER}${buildQueryString(params)}`);
    return response.json();
  },

  /**
   * Get statistics (total and severity counts)
   * Đơn giản hóa theo API mới - chỉ cần thời gian và systemName
   */
  async getStatistics(occurredAtFrom: string, occurredAtTo: string, systemName?: string) {
    const params: Record<string, any> = {};

    if (occurredAtFrom) params.occurredAtFrom = occurredAtFrom;
    if (occurredAtTo) params.occurredAtTo = occurredAtTo;
    if (systemName) params.systemName = systemName;

    const response = await fetchWithAuth(`${API_ENDPOINTS.LOG_ENTRIES.STATISTICS}${buildQueryString(params)}`);
    return response.json();
  },

  // Export to Excel
  async export(startDate: string, endDate: string, severity?: string, systemName?: string) {
    const params: Record<string, any> = {
      startDate,
      endDate,
    };
    if (severity) params.severity = severity;
    if (systemName) params.systemName = systemName;

    const response = await fetchWithAuth(`${API_ENDPOINTS.LOG_ENTRIES.EXPORT}${buildQueryString(params)}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log_entries_export_${startDate}_to_${endDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
