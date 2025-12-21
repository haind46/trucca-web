export interface LogEntry {
  id: number;
  severity: string;
  occurredAt: string;
  alarmDate: string;
  ancestry: string;
  systemName: string;
  hostName: string;
  hostIp: string;
  resourceName: string;
  target: string;
  resourceType: string;
  alarmName: string;
  conditionLog: string;
  eventType: string;
  eventSource: string;
  eventDetail: string;
  errorType: string;
  translatedDetail: string;
  analyzedBy: string;
  solutionSuggest: string;
  resourceAncestry: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * LogEntryFilters - API đã được đơn giản hóa
 * Chỉ còn 7 filter parameters chính theo API_FILTER_REWRITE.md
 */
export interface LogEntryFilters {
  page?: number;
  limit?: number;
  keyword?: string;              // Tìm kiếm trong system_name, host_name, alarm_name, event_detail
  severity?: string;             // CRITICAL, HIGH, MEDIUM, LOW, INFO
  occurredAtFrom?: string;       // ISO format: 2025-12-20T10:22:00
  occurredAtTo?: string;         // ISO format: 2025-12-21T10:22:00
  systemName?: string;           // Exact match
  sort_dir?: "asc" | "desc";
  sort_key?: string;
}

export interface LogEntryPaginatedResponse {
  items: LogEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
