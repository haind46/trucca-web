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

export interface LogEntryFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  severity?: string;
  occurredAtFrom?: string;
  occurredAtTo?: string;
  systemName?: string;
  hostName?: string;
  hostIp?: string;
  resourceName?: string;
  resourceType?: string;
  alarmName?: string;
  eventType?: string;
  eventSource?: string;
  errorType?: string;
  analyzedBy?: string;
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
