import { db } from "./db";
import { systems, contacts, groups, alertRules, schedules, alerts, incidents } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    console.log("Creating systems...");
    const systemData = await db.insert(systems).values([
      {
        name: "Core Database Server",
        ip: "192.168.1.10",
        level: 1,
        status: "critical",
        polestarCode: "DB-001",
      },
      {
        name: "Web Application",
        ip: "192.168.1.20",
        level: 1,
        status: "major",
        polestarCode: "WEB-001",
      },
      {
        name: "API Gateway",
        ip: "192.168.1.30",
        level: 2,
        status: "down",
        polestarCode: "API-001",
      },
      {
        name: "Backup Server",
        ip: "192.168.1.40",
        level: 2,
        status: "clear",
        polestarCode: "BAK-001",
      },
      {
        name: "Monitoring System",
        ip: "192.168.1.50",
        level: 3,
        status: "minor",
      },
      {
        name: "Cache Server",
        ip: "192.168.1.60",
        level: 3,
        status: "clear",
      },
    ]).returning();
    console.log(`✓ Created ${systemData.length} systems`);

    console.log("Creating contacts...");
    const contactData = await db.insert(contacts).values([
      {
        name: "Nguyễn Văn A",
        unit: "Operations",
        role: "Team Leader",
        email: "nguyen.van.a@example.com",
        phone: "0901234567",
      },
      {
        name: "Trần Thị B",
        unit: "Operations",
        role: "BO VH",
        email: "tran.thi.b@example.com",
        phone: "0901234568",
      },
      {
        name: "Lê Văn C",
        unit: "Operations",
        role: "BO KT",
        email: "le.van.c@example.com",
        phone: "0901234569",
      },
      {
        name: "Phạm Thị D",
        unit: "Development",
        role: "Developer",
        email: "pham.thi.d@example.com",
        phone: "0901234570",
      },
    ]).returning();
    console.log(`✓ Created ${contactData.length} contacts`);

    console.log("Creating groups...");
    const groupData = await db.insert(groups).values([
      {
        name: "Team Operations",
        memberIds: [String(contactData[0].id), String(contactData[1].id)],
        chatworkGroupId: "GRP001",
      },
      {
        name: "Development Team",
        memberIds: [String(contactData[2].id), String(contactData[3].id)],
        chatworkGroupId: "GRP002",
      },
    ]).returning();
    console.log(`✓ Created ${groupData.length} groups`);

    console.log("Creating alert rules...");
    const ruleData = await db.insert(alertRules).values([
      {
        name: "Critical Alert Rule",
        condition: "severity = 'critical'",
        severity: "critical",
        description: "Critical severity alerts",
      },
      {
        name: "Major Alert Rule",
        condition: "severity = 'major'",
        severity: "major",
        description: "Major severity alerts",
      },
      {
        name: "Minor Alert Rule",
        condition: "severity = 'minor'",
        severity: "minor",
        description: "Minor severity alerts",
      },
    ]).returning();
    console.log(`✓ Created ${ruleData.length} alert rules`);

    console.log("Creating schedules...");
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-GB").replace(/\//g, "/");
    
    await db.insert(schedules).values([
      {
        contactId: contactData[0].id,
        systemId: systemData[0].id,
        shift: "Ca sáng",
        date: todayStr,
        startTime: "08:00",
        endTime: "16:00",
      },
      {
        contactId: contactData[1].id,
        systemId: systemData[1].id,
        shift: "Ca chiều",
        date: todayStr,
        startTime: "16:00",
        endTime: "00:00",
      },
      {
        contactId: contactData[2].id,
        systemId: systemData[2].id,
        shift: "Ca đêm",
        date: todayStr,
        startTime: "00:00",
        endTime: "08:00",
      },
    ]);
    console.log("✓ Created 3 schedules");

    console.log("Creating alerts...");
    const alertData = await db.insert(alerts).values([
      {
        systemId: systemData[0].id,
        severity: "critical",
        message: "CPU usage above 95% for 10 minutes",
        details: "[2025-11-07 14:23:15] ERROR: High CPU utilization detected\nProcess: postgres (PID 1234)\nCPU: 96.8%\nMemory: 8.2GB/16GB",
      },
      {
        systemId: systemData[2].id,
        severity: "down",
        message: "Service unavailable - connection timeout",
        details: "[2025-11-07 14:18:32] CRITICAL: Gateway unreachable\nEndpoint: https://api.example.com\nStatus: Connection timeout",
      },
      {
        systemId: systemData[1].id,
        severity: "major",
        message: "Response time degradation detected",
      },
      {
        systemId: systemData[4].id,
        severity: "minor",
        message: "Disk usage at 85%",
      },
    ]).returning();
    console.log(`✓ Created ${alertData.length} alerts`);

    console.log("Creating incidents...");
    await db.insert(incidents).values([
      {
        alertId: alertData[0].id,
        systemId: systemData[0].id,
        severity: "critical",
        title: "High CPU Usage - Core Database",
        description: "Database server experiencing high CPU utilization",
        status: "open",
      },
      {
        alertId: alertData[1].id,
        systemId: systemData[2].id,
        severity: "down",
        title: "API Gateway Down",
        description: "API Gateway is unreachable",
        status: "investigating",
        assignedTo: contactData[0].id,
      },
      {
        alertId: alertData[2].id,
        systemId: systemData[1].id,
        severity: "major",
        title: "Web App Performance Issue",
        description: "Response time degradation on web application",
        status: "resolved",
        assignedTo: contactData[1].id,
        resolvedAt: new Date(),
      },
    ]);
    console.log("✓ Created 3 incidents");

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
