// AI features đã được loại bỏ
// Frontend sẽ gọi trực tiếp đến AI backend qua API
import type { Alert } from "@shared/schema";

export async function analyzeLogWithAI(logContent: string, systemName: string) {
  // Trả về response mặc định - frontend sẽ xử lý AI qua backend riêng
  return {
    analysis: "AI analysis sẽ được xử lý bởi frontend qua AI backend riêng.",
    severity: "minor" as const,
    suggestedActions: ["Kiểm tra log chi tiết", "Liên hệ team kỹ thuật"],
  };
}

export async function processAlertWithAI(alert: Alert, systemName: string) {
  // AI processing sẽ được xử lý bởi frontend qua AI backend riêng
  // Trả về null để không làm gì thêm
  return null;
}
