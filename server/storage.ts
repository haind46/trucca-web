import { db } from "./db";
import {
  systems,
  contacts,
  groups,
  alertRules,
  alerts,
  schedules,
  incidents,
  notifications,
  logAnalysis,
  type System,
  type InsertSystem,
  type Contact,
  type InsertContact,
  type Group,
  type InsertGroup,
  type AlertRule,
  type InsertAlertRule,
  type Alert,
  type InsertAlert,
  type Schedule,
  type InsertSchedule,
  type Incident,
  type InsertIncident,
  type Notification,
  type InsertNotification,
  type LogAnalysis,
  type InsertLogAnalysis,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getSystems(): Promise<System[]>;
  getSystemById(id: number): Promise<System | undefined>;
  createSystem(data: InsertSystem): Promise<System>;
  updateSystem(id: number, data: Partial<InsertSystem>): Promise<System | undefined>;
  deleteSystem(id: number): Promise<boolean>;
  updateSystemStatus(id: number, status: string): Promise<void>;

  getContacts(): Promise<Contact[]>;
  getContactById(id: number): Promise<Contact | undefined>;
  createContact(data: InsertContact): Promise<Contact>;
  updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  getGroups(): Promise<Group[]>;
  getGroupById(id: number): Promise<Group | undefined>;
  createGroup(data: InsertGroup): Promise<Group>;
  updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;

  getAlertRules(): Promise<AlertRule[]>;
  getAlertRuleById(id: number): Promise<AlertRule | undefined>;
  createAlertRule(data: InsertAlertRule): Promise<AlertRule>;
  updateAlertRule(id: number, data: Partial<InsertAlertRule>): Promise<AlertRule | undefined>;
  deleteAlertRule(id: number): Promise<boolean>;

  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  getAlertById(id: number): Promise<Alert | undefined>;
  createAlert(data: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert | undefined>;
  resolveAlert(id: number, resolvedBy: string): Promise<Alert | undefined>;

  getSchedules(): Promise<Schedule[]>;
  getSchedulesByDate(date: string): Promise<Schedule[]>;
  createSchedule(data: InsertSchedule): Promise<Schedule>;
  deleteSchedule(id: number): Promise<boolean>;

  getIncidents(): Promise<Incident[]>;
  getIncidentById(id: number): Promise<Incident | undefined>;
  createIncident(data: InsertIncident): Promise<Incident>;
  updateIncidentStatus(id: number, status: string, resolution?: string): Promise<Incident | undefined>;
  assignIncident(id: number, assignedTo: string): Promise<Incident | undefined>;

  getNotifications(): Promise<Notification[]>;
  getNotificationsByIncident(incidentId: number): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  updateNotificationStatus(id: number, status: string, sentAt?: Date, error?: string): Promise<void>;

  getLogAnalysis(): Promise<LogAnalysis[]>;
  createLogAnalysis(data: InsertLogAnalysis): Promise<LogAnalysis>;
}

export class DatabaseStorage implements IStorage {
  async getSystems(): Promise<System[]> {
    return await db.select().from(systems).orderBy(desc(systems.createdAt));
  }

  async getSystemById(id: number): Promise<System | undefined> {
    const result = await db.select().from(systems).where(eq(systems.id, id));
    return result[0];
  }

  async createSystem(data: InsertSystem): Promise<System> {
    const result = await db.insert(systems).values(data).returning();
    return result[0];
  }

  async updateSystem(id: number, data: Partial<InsertSystem>): Promise<System | undefined> {
    const result = await db.update(systems).set(data).where(eq(systems.id, id)).returning();
    return result[0];
  }

  async deleteSystem(id: number): Promise<boolean> {
    const result = await db.delete(systems).where(eq(systems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateSystemStatus(id: number, status: string): Promise<void> {
    await db.update(systems).set({ status }).where(eq(systems.id, id));
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContactById(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(data).returning();
    return result[0];
  }

  async updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined> {
    const result = await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getGroups(): Promise<Group[]> {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id));
    return result[0];
  }

  async createGroup(data: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values(data).returning();
    return result[0];
  }

  async updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group | undefined> {
    const result = await db.update(groups).set(data).where(eq(groups.id, id)).returning();
    return result[0];
  }

  async deleteGroup(id: number): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAlertRules(): Promise<AlertRule[]> {
    return await db.select().from(alertRules).orderBy(desc(alertRules.createdAt));
  }

  async getAlertRuleById(id: number): Promise<AlertRule | undefined> {
    const result = await db.select().from(alertRules).where(eq(alertRules.id, id));
    return result[0];
  }

  async createAlertRule(data: InsertAlertRule): Promise<AlertRule> {
    const result = await db.insert(alertRules).values(data).returning();
    return result[0];
  }

  async updateAlertRule(id: number, data: Partial<InsertAlertRule>): Promise<AlertRule | undefined> {
    const result = await db.update(alertRules).set(data).where(eq(alertRules.id, id)).returning();
    return result[0];
  }

  async deleteAlertRule(id: number): Promise<boolean> {
    const result = await db.delete(alertRules).where(eq(alertRules.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts)
      .where(and(eq(alerts.resolved, false)))
      .orderBy(desc(alerts.createdAt));
  }

  async getAlertById(id: number): Promise<Alert | undefined> {
    const result = await db.select().from(alerts).where(eq(alerts.id, id));
    return result[0];
  }

  async createAlert(data: InsertAlert): Promise<Alert> {
    const result = await db.insert(alerts).values(data).returning();
    return result[0];
  }

  async acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert | undefined> {
    const result = await db.update(alerts)
      .set({
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      })
      .where(eq(alerts.id, id))
      .returning();
    return result[0];
  }

  async resolveAlert(id: number, resolvedBy: string): Promise<Alert | undefined> {
    const result = await db.update(alerts)
      .set({
        resolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      })
      .where(eq(alerts.id, id))
      .returning();
    return result[0];
  }

  async getSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules).orderBy(desc(schedules.createdAt));
  }

  async getSchedulesByDate(date: string): Promise<Schedule[]> {
    return await db.select().from(schedules).where(eq(schedules.date, date));
  }

  async createSchedule(data: InsertSchedule): Promise<Schedule> {
    const result = await db.insert(schedules).values(data).returning();
    return result[0];
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncidentById(id: number): Promise<Incident | undefined> {
    const result = await db.select().from(incidents).where(eq(incidents.id, id));
    return result[0];
  }

  async createIncident(data: InsertIncident): Promise<Incident> {
    const result = await db.insert(incidents).values(data).returning();
    return result[0];
  }

  async updateIncidentStatus(id: number, status: string, resolution?: string): Promise<Incident | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (resolution) {
      updateData.resolution = resolution;
    }
    const result = await db.update(incidents)
      .set(updateData)
      .where(eq(incidents.id, id))
      .returning();
    return result[0];
  }

  async assignIncident(id: number, assignedTo: string): Promise<Incident | undefined> {
    const result = await db.update(incidents)
      .set({ assignedTo, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return result[0];
  }

  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getNotificationsByIncident(incidentId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.incidentId, incidentId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(data).returning();
    return result[0];
  }

  async updateNotificationStatus(id: number, status: string, sentAt?: Date, error?: string): Promise<void> {
    const updateData: any = { status };
    if (sentAt) updateData.sentAt = sentAt;
    if (error) updateData.error = error;
    await db.update(notifications).set(updateData).where(eq(notifications.id, id));
  }

  async getLogAnalysis(): Promise<LogAnalysis[]> {
    return await db.select().from(logAnalysis).orderBy(desc(logAnalysis.createdAt));
  }

  async createLogAnalysis(data: InsertLogAnalysis): Promise<LogAnalysis> {
    const result = await db.insert(logAnalysis).values(data).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
