import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import doctorRoutes from "./routes/doctor.routes";
import appointmentRoutes from "./routes/appointment.routes";
import auditRoutes from "./routes/audit.routes";

import { Logger } from "./services/logger.service";
import { AuditService } from "./services/audit.service";
import { apiLimiter } from "./middlewares/ratelimit.middleware";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.url}`, { ip: req.ip });
  next();
});

// Rate Limiting
app.use(apiLimiter);


app.use("/auth", authRoutes);
app.use("/doctors", doctorRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/audit-logs", auditRoutes);


app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  Logger.error("Unhandled Error", err);
  res.status(500).send("Something broke!");
});


app.listen(PORT, async () => {
  Logger.info(`Server is running on port ${PORT}`);
  

  await AuditService.initTable();
});
