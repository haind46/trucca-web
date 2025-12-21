import type { Express } from "express";
import { storage } from "./storage";
import {
  insertSystemSchema,
  insertContactSchema,
  insertGroupSchema,
  insertAlertRuleSchema,
  insertAlertSchema,
  insertScheduleSchema,
  insertIncidentSchema,
} from "@shared/schema";
import { analyzeLogWithAI, processAlertWithAI } from "./services/ai";
import { sendMultiChannelNotification } from "./services/notifications";

export async function registerRoutes(app: Express) {
  app.get("/api/systems", async (req, res) => {
    try {
      const systems = await storage.getSystems();
      res.json(systems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/systems/:id", async (req, res) => {
    try {
      const system = await storage.getSystemById(parseInt(req.params.id));
      if (!system) {
        return res.status(404).json({ error: "System not found" });
      }
      res.json(system);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/systems", async (req, res) => {
    try {
      const data = insertSystemSchema.parse(req.body);
      const system = await storage.createSystem(data);
      res.status(201).json(system);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/systems/:id", async (req, res) => {
    try {
      const system = await storage.updateSystem(parseInt(req.params.id), req.body);
      if (!system) {
        return res.status(404).json({ error: "System not found" });
      }
      res.json(system);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/systems/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSystem(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "System not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateContact(parseInt(req.params.id), req.body);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteContact(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const data = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(data);
      res.status(201).json(group);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.updateGroup(parseInt(req.params.id), req.body);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      res.json(group);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGroup(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Group not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rules", async (req, res) => {
    try {
      const rules = await storage.getAlertRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rules", async (req, res) => {
    try {
      const data = insertAlertRuleSchema.parse(req.body);
      const rule = await storage.createAlertRule(data);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/rules/:id", async (req, res) => {
    try {
      const rule = await storage.updateAlertRule(parseInt(req.params.id), req.body);
      if (!rule) {
        return res.status(404).json({ error: "Alert rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/rules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAlertRule(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Alert rule not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/alerts/active", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const data = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(data);
      
      const system = await storage.getSystemById(alert.systemId);
      await storage.updateSystemStatus(alert.systemId, alert.severity);
      
      const incident = await storage.createIncident({
        alertId: alert.id,
        systemId: alert.systemId,
        title: `${alert.severity.toUpperCase()}: ${system?.name || 'Unknown System'}`,
        description: alert.message,
        severity: alert.severity,
      });

      const aiAnalysis = await processAlertWithAI(alert, system?.name || "Unknown");
      if (aiAnalysis) {
        await storage.updateIncidentStatus(incident.id, incident.status, undefined);
      }

      await sendMultiChannelNotification(incident, alert, system);

      res.status(201).json(alert);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const { acknowledgedBy } = req.body;
      if (!acknowledgedBy) {
        return res.status(400).json({ error: "acknowledgedBy is required" });
      }
      const alert = await storage.acknowledgeAlert(parseInt(req.params.id), acknowledgedBy);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const { resolvedBy } = req.body;
      if (!resolvedBy) {
        return res.status(400).json({ error: "resolvedBy is required" });
      }
      const alert = await storage.resolveAlert(parseInt(req.params.id), resolvedBy);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      if (alert.severity === "clear") {
        await storage.updateSystemStatus(alert.systemId, "clear");
      }
      
      res.json(alert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/schedules", async (req, res) => {
    try {
      const { date } = req.query;
      const schedules = date 
        ? await storage.getSchedulesByDate(date as string)
        : await storage.getSchedules();
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const data = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(data);
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSchedule(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/incidents/:id/assign", async (req, res) => {
    try {
      const { assignedTo } = req.body;
      if (!assignedTo) {
        return res.status(400).json({ error: "assignedTo is required" });
      }
      const incident = await storage.assignIncident(parseInt(req.params.id), assignedTo);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/incidents/:id/resolve", async (req, res) => {
    try {
      const { resolution } = req.body;
      if (!resolution) {
        return res.status(400).json({ error: "resolution is required" });
      }
      const incident = await storage.updateIncidentStatus(
        parseInt(req.params.id),
        "resolved",
        resolution
      );
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/logs/analyze", async (req, res) => {
    try {
      const { systemId, logContent } = req.body;
      if (!systemId || !logContent) {
        return res.status(400).json({ error: "systemId and logContent are required" });
      }

      const system = await storage.getSystemById(systemId);
      if (!system) {
        return res.status(404).json({ error: "System not found" });
      }

      const analysis = await analyzeLogWithAI(logContent, system.name);
      
      const logAnalysis = await storage.createLogAnalysis({
        systemId,
        logContent,
        aiAnalysis: analysis.analysis,
        suggestedActions: analysis.suggestedActions,
        severity: analysis.severity,
      });

      res.json(logAnalysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // app.get("/api/stats", async (req, res) => {
  //   try {
  //     const systems = await storage.getSystems();
  //     const activeAlerts = await storage.getActiveAlerts();
  //     const incidents = await storage.getIncidents();
      
  //     const todayIncidents = incidents.filter(i => {
  //       const today = new Date().toDateString();
  //       return new Date(i.createdAt).toDateString() === today;
  //     });

  //     const resolvedToday = todayIncidents.filter(i => i.status === "resolved");
      
  //     const stats = {
  //       totalSystems: systems.length,
  //       activeAlerts: activeAlerts.length,
  //       resolvedToday: resolvedToday.length,
  //       averageResponseTime: "3.2m",
  //     };

  //     res.json(stats);
  //   } catch (error: any) {
  //     res.status(500).json({ error: error.message });
  //   }
  // });

  return app;
}
