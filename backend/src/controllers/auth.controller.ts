import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

import { db } from "../db/connection";
import { Logger } from "../services/logger.service";
import { AuditService } from "../services/audit.service";

type Role = "ADMIN" | "DOCTOR" | "ASSISTANT" | "PATIENT";

const SALT_ROUNDS = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET missing in .env");
  }
  return secret;
}


function signToken(payload: { sub: string; role: Role }): string {
  const secret: Secret = getJwtSecret();

  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1d";

  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
}




function publicUser(u: any) {
  return {
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

export const register = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, role, ...profileData } = req.body as {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: Role;
    speciality?: string;
    license_number?: string;
    clinic_address?: string;
    phone?: string;

    age?: number;
    sexe?: "homme" | "femme";
  };
  
  Logger.info("Register attempt", { email, role });

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      Logger.warn("Register failed: Email exists", { email });
      return res.status(409).json({ message: "Email already in use" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await db.query(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, first_name, last_name, email, role, created_at, updated_at
      `,
      [first_name, last_name, email, password_hash, role]
    );

    const user = userResult.rows[0];

    if (role === "DOCTOR") {
      const speciality = profileData.speciality;
      const license_number = profileData.license_number;
      const clinic_address = profileData.clinic_address;
      const phone = profileData.phone;

      if (!speciality || !license_number) {
        return res.status(400).json({
          message: "Missing doctor profile fields",
          details: ["speciality and license_number are required for DOCTOR"],
        });
      }

      await db.query(
        `
        INSERT INTO doctor_profiles
          (user_id, speciality, license_number, clinic_address, phone, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `,
        [user.id, speciality, license_number, clinic_address || null, phone || null]
      );
    }

    if (role === "PATIENT") {
      const age = profileData.age;
      const sexe = profileData.sexe;
      const phone = profileData.phone;

      if (age !== undefined || sexe !== undefined || phone !== undefined) {
        await db.query(
          `
          INSERT INTO patient_profiles
            (user_id, age, phone, sexe, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          `,
          [user.id, age ?? null, phone ?? null, sexe ?? null]
        );
      }
    }

    const token = signToken({ sub: user.id, role: user.role });

    await AuditService.log({
      userId: user.id,
      action: "REGISTER",
      endpoint: "/auth/register",
      ipAddress: req.ip || "unknown",
      status: "SUCCESS",
      details: { role: user.role }
    });

    return res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    Logger.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email, role, password_hash FROM users WHERE email = $1`,
      [email]
    );

    if (!result.rowCount) {
      Logger.warn("Login failed: User not found", { email, ip: req.ip });
      await AuditService.log({
        action: "LOGIN",
        endpoint: "/auth/login",
        ipAddress: req.ip || "unknown",
        status: "FAILURE",
        details: { reason: "User not found", email }
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
        Logger.warn("Login failed: Invalid password", { email, ip: req.ip });
        await AuditService.log({
          userId: user.id,
          action: "LOGIN",
          endpoint: "/auth/login",
          ipAddress: req.ip || "unknown",
          status: "FAILURE",
          details: { reason: "Invalid password" }
        });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ sub: user.id, role: user.role });

    await AuditService.log({
        userId: user.id,
        action: "LOGIN",
        endpoint: "/auth/login",
        ipAddress: req.ip || "unknown",
        status: "SUCCESS"
      });

    return res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    Logger.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const me = async (req: Request, res: Response) => {
  
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await db.query(
      "SELECT id, first_name, last_name, email, role, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    Logger.error("Me error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
