import { Router } from "express";
import { validateBody } from "../middlewares/validate.middleware";
import { RegisterSchema, LoginSchema } from "../dto/user.dto";
import { register, login, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/ratelimit.middleware";

const router = Router();

router.post("/register", authLimiter, validateBody(RegisterSchema), register);
router.post("/login", authLimiter, validateBody(LoginSchema), login);


router.get("/me", authMiddleware, me);

export default router;
