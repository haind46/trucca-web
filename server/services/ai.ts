import OpenAI from "openai";
import type { Alert } from "@shared/schema";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access 
// without requiring your own OpenAI API key. Charges are billed to your credits.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export async function analyzeLogWithAI(logContent: string, systemName: string) {
  try {
    const prompt = `Bạn là một chuyên gia phân tích log hệ thống. Hãy phân tích log sau đây từ hệ thống "${systemName}" và cung cấp:

1. Tóm tắt vấn đề
2. Mức độ nghiêm trọng (down/critical/major/minor/clear)
3. Nguyên nhân có thể xảy ra
4. Các hành động khắc phục được đề xuất

Log content:
${logContent}

Trả lời bằng tiếng Việt, ngắn gọn và rõ ràng.`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là chuyên gia phân tích log hệ thống IT, chuyên về giám sát và xử lý sự cố.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 500,
    });

    const analysis = response.choices[0].message.content || "Không thể phân tích log";
    
    const severityMatch = analysis.match(/\b(down|critical|major|minor|clear)\b/i);
    const severity = severityMatch ? severityMatch[1].toLowerCase() : "minor";

    const suggestedActions = extractActions(analysis);

    return {
      analysis,
      severity,
      suggestedActions,
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      analysis: "Không thể phân tích log bằng AI. Vui lòng kiểm tra thủ công.",
      severity: "minor",
      suggestedActions: ["Kiểm tra log chi tiết", "Liên hệ team kỹ thuật"],
    };
  }
}

export async function processAlertWithAI(alert: Alert, systemName: string) {
  try {
    const prompt = `Bạn là hệ thống AI hỗ trợ vận hành. Một cảnh báo mới vừa phát sinh:

Hệ thống: ${systemName}
Mức độ: ${alert.severity}
Thông báo: ${alert.message}
${alert.details ? `Chi tiết:\n${alert.details}` : ""}

Hãy:
1. Đánh giá mức độ ưu tiên xử lý
2. Đề xuất người/team nên được thông báo
3. Đưa ra các bước xử lý ban đầu
4. Dự đoán tác động có thể xảy ra

Trả lời ngắn gọn bằng tiếng Việt.`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là AI assistant hỗ trợ vận hành hệ thống 24/7, chuyên về phản ứng nhanh với sự cố.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 400,
    });

    return response.choices[0].message.content || null;
  } catch (error) {
    console.error("AI alert processing error:", error);
    return null;
  }
}

function extractActions(analysis: string): string[] {
  const actions: string[] = [];
  
  const lines = analysis.split('\n');
  for (const line of lines) {
    if (line.match(/^[\d\-\*•]\s*/) || line.toLowerCase().includes('khắc phục') || line.toLowerCase().includes('hành động')) {
      const cleaned = line.replace(/^[\d\-\*•]\s*/, '').trim();
      if (cleaned && cleaned.length > 5 && cleaned.length < 200) {
        actions.push(cleaned);
      }
    }
  }
  
  if (actions.length === 0) {
    actions.push("Kiểm tra log chi tiết");
    actions.push("Liên hệ team kỹ thuật");
  }
  
  return actions.slice(0, 5);
}
