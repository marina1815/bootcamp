import { Request, Response } from "express";
import { db } from "../db/connection";

import { DoctorProfile } from "../models/doctorprofile.model";

// Get all doctors with their user info
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        dp.speciality, 
        dp.license_number as "licenseNumber", 
        dp.clinic_address as "clinicAddress", 
        dp.phone
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'DOCTOR'
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



/**
 * 🔹 Create Doctor Profile
 * Requires authMiddleware + requireRole("DOCTOR") in route
 */
export const createDoctorProfile = async (req: Request, res: Response) => {
  try {
    // 🔐 Ensure authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    // Optional: ensure role is DOCTOR
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ message: "Only doctors can create profile" });
    }

    const {
      speciality,
      licenseNumber,
      clinicName,
      clinicAddress,
      phone,
    } = req.body;

    // 🔍 Check if profile already exists
    const existing = await db.query(
      `SELECT id FROM doctor_profiles WHERE user_id = $1`,
      [userId]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({
        message: "Doctor profile already exists",
      });
    }

    // 📝 Insert new profile
    const result = await db.query(
      `
      INSERT INTO doctor_profiles 
      (user_id, speciality, license_number, clinic_name, clinic_address, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        speciality,
        license_number as "licenseNumber",
        clinic_name as "clinicName",
        clinic_address as "clinicAddress",
        phone
      `,
      [userId, speciality, licenseNumber, clinicName, clinicAddress, phone]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Error creating doctor profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

