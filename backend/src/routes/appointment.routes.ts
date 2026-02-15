import { Router } from "express";
import { createAppointment, getAppointments, getStats } from "../controllers/appointment.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// Create new appointment (Patient only?)
// Ideally only patients request appointments, but maybe doctors can schedule follow-ups?
// Let's assume patients initiate for now, or allow any authenticated user.
router.post("/", authMiddleware, createAppointment);

// Get appointments (Patient sees theirs, Doctor sees theirs)
router.get("/", authMiddleware, getAppointments);

// Get stats (Doctor only)
router.get("/stats", authMiddleware, requireRole("DOCTOR"), getStats);

export default router;
