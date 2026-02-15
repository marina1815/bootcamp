import { db } from "../db/connection";
import { Logger } from "./logger.service";

export interface AuditLogParams {
  userId?: string;
  action: string;
  endpoint?: string;
  ipAddress?: string;
  status: "SUCCESS" | "FAILURE" | "DENIED";
  details?: any;
}

export class AuditService {
 
  static async initTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        endpoint VARCHAR(255),
        ip_address VARCHAR(45),
        status VARCHAR(20) NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    try {
      await db.query(query);
      Logger.info(" Audit Logs table checked/created");
    } catch (error) {
      Logger.error(" Failed to init audit logs table", error);
    }
  }

 
  static async log(params: AuditLogParams) {
    const { userId, action, endpoint, ipAddress, status, details } = params;

    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, endpoint, ip_address, status, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId || null, action, endpoint || null, ipAddress || null, status, details || null]
      );
      Logger.info(`Audit: [${status}] ${action} by ${userId || "Guest"}`);
    } catch (error) {
      Logger.error(" Failed to write audit log", error);
    }
  }
}
