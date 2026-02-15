import { Router } from "express";
import { getAllDoctors } from "../controllers/doctorprofile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getAllDoctors);

export default router;
