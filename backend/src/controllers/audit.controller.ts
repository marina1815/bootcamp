import { Request, Response } from "express";
import { db } from "../db/connection";
import { Logger } from "../services/logger.service";

export const getLogs = async (req: Request, res: Response) => {
  try {
    const limit = 100;
    const query = `
      SELECT a.*, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    
    return res.json(result.rows);
  } catch (error) {
    Logger.error("Error fetching audit logs", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
