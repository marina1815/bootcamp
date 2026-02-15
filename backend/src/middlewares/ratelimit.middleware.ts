import rateLimit from "express-rate-limit";
import { Logger } from "../services/logger.service";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    message: "Too many login attempts, please try again later."
  },
  handler: (req: any, res: any, next: any, options: any) => {
    Logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please slow down."
  }
});
