import { Router } from "express";
import { validateBody } from "../middlewares/validate.middleware";
import { RegisterSchema, LoginSchema } from "../dto/user.dto";
import { register, login, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateBody(RegisterSchema), register);
router.post("/login", validateBody(LoginSchema), login);


// route protégée (test token)
router.get("/me", authMiddleware, me);

export default router;
