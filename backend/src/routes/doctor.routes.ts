import { Router } from "express";
import { getAllDoctors } from "../controllers/doctorprofile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public or Protected? Maybe protected for Patients?
// Making it public for now to list doctors easily, or protected if only logged in users can see.
// The request says "after logging in he can select a doctor", so it should be protected.
router.get("/", authMiddleware, getAllDoctors);

export default router;
