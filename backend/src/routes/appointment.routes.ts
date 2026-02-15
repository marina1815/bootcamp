import { Router } from "express";
import { createAppointment, getAppointments, getStats } from "../controllers/appointment.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createAppointment);

router.get("/", authMiddleware, getAppointments);

router.get("/stats", authMiddleware, requireRole("DOCTOR"), getStats);

export default router;
