import { Request, Response } from "express";
import { db } from "../db/connection";
import { Appointment } from "../models/appointment.model";

export const createAppointment = async (req: Request, res: Response) => {
  const { doctorId, dateTime, reason } = req.body;
  const patientId = (req as any).user.id;

  try {
    const result = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, date_time, status, reason)
       VALUES ($1, $2, $3, 'SCHEDULED', $4)
       RETURNING *`,
      [patientId, doctorId, dateTime, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    let query = `
      SELECT a.*, 
             p.first_name as patient_firstname, p.last_name as patient_lastname,
             d.first_name as doctor_firstname, d.last_name as doctor_lastname
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
    `;

    if (userRole === "PATIENT") {
      query += ` WHERE a.patient_id = $1`;
    } else if (userRole === "DOCTOR") {
      query += ` WHERE a.doctor_id = $1`;
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    query += ` ORDER BY a.date_time DESC`;

    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStats = async (req: Request, res: Response) => {
  const doctorId = (req as any).user.id; 

  try {
    const totalAppointments = await db.query(
      `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1`,
      [doctorId]
    );

    const todayAppointments = await db.query(
      `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND DATE(date_time) = CURRENT_DATE`,
      [doctorId]
    );
    
    const totalPatients = await db.query(
      `SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1`,
      [doctorId]
    );


    res.json({
      totalAppointments: parseInt(totalAppointments.rows[0].count),
      todayAppointments: parseInt(todayAppointments.rows[0].count),
      totalPatients: parseInt(totalPatients.rows[0].count)
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
