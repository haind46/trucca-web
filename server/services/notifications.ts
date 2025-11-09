import type { Incident, Alert, System } from "@shared/schema";
import { storage } from "../storage";

export async function sendMultiChannelNotification(
  incident: Incident,
  alert: Alert,
  system: System | null | undefined
) {
  try {
    const systemName = system?.name || "Unknown System";
    const message = formatNotificationMessage(incident, alert, systemName);

    if (alert.severity === "down" || alert.severity === "critical") {
      await sendChatworkNotification(incident, message, system);
      await sendEmailNotification(incident, message, system);
      await sendSMSNotification(incident, message, system);
    } else if (alert.severity === "major") {
      await sendChatworkNotification(incident, message, system);
      await sendEmailNotification(incident, message, system);
    } else {
      await sendChatworkNotification(incident, message, system);
    }

    console.log(`✓ Multi-channel notifications sent for incident #${incident.id}`);
  } catch (error) {
    console.error("Notification error:", error);
  }
}

async function sendChatworkNotification(
  incident: Incident,
  message: string,
  system: System | null | undefined
) {
  try {
    const chatworkGroupId = system?.chatworkGroupId || "GENERAL_GROUP";
    
    console.log(`[CHATWORK] Sending to group ${chatworkGroupId}:`);
    console.log(message);
    console.log("---");

    const notification = await storage.createNotification({
      incidentId: incident.id,
      channel: "chatwork",
      recipient: chatworkGroupId,
      message,
    });

    await storage.updateNotificationStatus(
      notification.id,
      "sent",
      new Date(),
      undefined
    );

    await simulateDelay(500);
  } catch (error: any) {
    console.error("Chatwork notification failed:", error);
    const failedNotification = await storage.createNotification({
      incidentId: incident.id,
      channel: "chatwork",
      recipient: system?.chatworkGroupId || "GENERAL_GROUP",
      message,
    });
    await storage.updateNotificationStatus(
      failedNotification.id,
      "failed",
      undefined,
      error.message
    );
  }
}

async function sendEmailNotification(
  incident: Incident,
  message: string,
  system: System | null | undefined
) {
  try {
    const emails = await getNotificationEmails(incident.severity);
    
    for (const email of emails) {
      console.log(`[EMAIL] Sending to ${email}:`);
      console.log(`Subject: [${incident.severity.toUpperCase()}] ${incident.title}`);
      console.log(message);
      console.log("---");

      const notification = await storage.createNotification({
        incidentId: incident.id,
        channel: "email",
        recipient: email,
        message,
      });

      await storage.updateNotificationStatus(
        notification.id,
        "sent",
        new Date(),
        undefined
      );
    }

    await simulateDelay(300);
  } catch (error: any) {
    console.error("Email notification failed:", error);
  }
}

async function sendSMSNotification(
  incident: Incident,
  message: string,
  system: System | null | undefined
) {
  try {
    const phones = await getNotificationPhones(incident.severity);
    
    const smsMessage = `[TRỰC CA AI] ${incident.severity.toUpperCase()}: ${incident.title}. ${incident.description.substring(0, 100)}`;
    
    for (const phone of phones) {
      console.log(`[SMS] Sending to ${phone}:`);
      console.log(smsMessage);
      console.log("---");

      const notification = await storage.createNotification({
        incidentId: incident.id,
        channel: "sms",
        recipient: phone,
        message: smsMessage,
      });

      await storage.updateNotificationStatus(
        notification.id,
        "sent",
        new Date(),
        undefined
      );
    }

    await simulateDelay(400);
  } catch (error: any) {
    console.error("SMS notification failed:", error);
  }
}

function formatNotificationMessage(incident: Incident, alert: Alert, systemName: string): string {
  const timestamp = new Date(incident.createdAt).toLocaleString("vi-VN");
  
  return `
🚨 CẢNH BÁO HỆ THỐNG

📌 Mức độ: ${incident.severity.toUpperCase()}
🖥️  Hệ thống: ${systemName}
⏰ Thời gian: ${timestamp}

📋 Mô tả:
${incident.description}

${alert.details ? `\n📝 Chi tiết:\n${alert.details}\n` : ""}
🔗 Incident ID: #${incident.id}

---
Vui lòng xác nhận và xử lý sớm nhất.
MobiFone - Trực Ca AI
`.trim();
}

async function getNotificationEmails(severity: string): Promise<string[]> {
  const contacts = await storage.getContacts();
  
  if (severity === "down" || severity === "critical") {
    return contacts
      .filter(c => c.role.includes("LD") || c.role.includes("leader"))
      .map(c => c.email);
  } else if (severity === "major") {
    return contacts
      .filter(c => c.role.includes("LD") || c.role.includes("BO"))
      .map(c => c.email);
  } else {
    return contacts
      .filter(c => c.role.includes("BO"))
      .map(c => c.email)
      .slice(0, 3);
  }
}

async function getNotificationPhones(severity: string): Promise<string[]> {
  const contacts = await storage.getContacts();
  
  if (severity === "down" || severity === "critical") {
    return contacts
      .filter(c => c.role.includes("LDTT") || c.role.includes("LDP"))
      .map(c => c.phone);
  }
  
  return [];
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
