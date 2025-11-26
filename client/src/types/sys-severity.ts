/**
 * SysSeverity Types & Interfaces (Simplified Version)
 * Các trường đã bỏ: display_order, notify_to_level, auto_call, tts_template,
 * clear_strategy, auto_clear_enabled, clear_tts_template, repeat_count, interval_minutes
 */

/**
 * Severity Configuration Object (Simplified)
 */
export interface SysSeverity {
  id: string;

  // Severity Info
  severityCode: string;        // DOWN, CRITICAL, MAJOR, MINOR, WARNING
  severityName: string;        // Tên hiển thị
  description?: string;        // Mô tả chi tiết

  // UI Display
  colorCode?: string;          // #FF0000, #FFFF00
  iconName?: string;           // alert-circle, alert-triangle
  priorityLevel: number;       // 1-5 (5 cao nhất)

  // Clear Config (Simplified)
  clearCycleCount?: number;    // Số chu kỳ liên tiếp bình thường để auto clear
  clearTimeoutMinutes?: number; // Thời gian (phút) không có vi phạm để auto clear
  clearNotificationEnabled: boolean; // Bật thông báo khi clear

  // Status
  isActive: boolean;

  // Metadata
  createdAt: string;           // ISO 8601
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Request DTO cho Create/Edit (Simplified)
 */
export interface SysSeverityRequest {
  severityCode: string;
  severityName: string;
  description?: string;
  colorCode?: string;
  iconName?: string;
  priorityLevel: number;
  clearCycleCount?: number;
  clearTimeoutMinutes?: number;
  clearNotificationEnabled?: boolean;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Form Data for Create/Edit Dialog (Simplified)
 */
export interface SysSeverityFormData {
  severityCode: string;
  severityName: string;
  description: string;
  colorCode: string;
  iconName: string;
  priorityLevel: number;
  clearCycleCount: number;
  clearTimeoutMinutes: number;
  clearNotificationEnabled: boolean;
  isActive: boolean;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];            // Array of items
    total: number;        // Total count
    page: number;         // Current page (0-indexed)
    size: number;         // Items per page
  };
  message: string;
  statusCode: number;
}

/**
 * Single Item Response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

/**
 * List Query Parameters
 */
export interface SeverityListParams {
  page?: number;           // 1-indexed (frontend gửi 1, 2, 3...)
  limit?: number;          // Default: 10
  keyword?: string;        // Tìm kiếm
  sort_dir?: 'asc' | 'desc';  // Default: desc
  sort_key?: string;       // Default: priorityLevel (camelCase theo Java entity)
}
