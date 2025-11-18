import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Sử dụng default DATABASE_URL nếu không được cung cấp (cho môi trường dev/test)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/trucca';

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL not set. Using default connection string. This may cause connection errors in production.",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
