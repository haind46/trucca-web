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

  // Filter log entries with advanced criteria
  async filter(filters: LogEntryFilters) {
    const params: Record<string, any> = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      sort_dir: filters.sort_dir || "desc",
      sort_key: filters.sort_key || "occurred_at",
    };

    // Add optional filters
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.severity) params.severity = filters.severity;
    if (filters.occurredAtFrom) params.occurredAtFrom = filters.occurredAtFrom;
    if (filters.occurredAtTo) params.occurredAtTo = filters.occurredAtTo;
    if (filters.systemName) params.systemName = filters.systemName;
    if (filters.hostName) params.hostName = filters.hostName;
    if (filters.hostIp) params.hostIp = filters.hostIp;
    if (filters.resourceName) params.resourceName = filters.resourceName;
    if (filters.resourceType) params.resourceType = filters.resourceType;
    if (filters.alarmName) params.alarmName = filters.alarmName;
    if (filters.eventType) params.eventType = filters.eventType;
    if (filters.eventSource) params.eventSource = filters.eventSource;
    if (filters.errorType) params.errorType = filters.errorType;
    if (filters.analyzedBy) params.analyzedBy = filters.analyzedBy;

    const response = await fetchWithAuth(`${API_ENDPOINTS.LOG_ENTRIES.FILTER}${buildQueryString(params)}`);
    return response.json();
  },

  // Get statistics (total and severity counts)
  async getStatistics(occurredAtFrom: string, occurredAtTo: string, systemName?: string, hostName?: string, hostIp?: string) {
    const params: Record<string, any> = {
      occurredAtFrom,
      occurredAtTo,
    };
    if (systemName) params.systemName = systemName;
    if (hostName) params.hostName = hostName;
    if (hostIp) params.hostIp = hostIp;

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
