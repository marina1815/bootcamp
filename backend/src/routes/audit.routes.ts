import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { getLogs } from "../controllers/audit.controller";

const router = Router();

router.use(authMiddleware, requireRole("ADMIN"));

router.get("/", getLogs);

export default router;
