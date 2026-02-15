import { Router } from "express";
import { validateBody } from "../middlewares/validate.middleware";
import { CreateDoctorProfileSchema } from "../dto/doctorprofile.dto";
import { createDoctorProfile } from "../controllers/doctorprofile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/doctor-profile",
  authMiddleware,                       
  validateBody(CreateDoctorProfileSchema), 
  createDoctorProfile             
);

export default router;
