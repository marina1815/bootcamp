import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

// ✅ Payload attendu dans le JWT
const JwtPayloadSchema = z.object({
  sub: z.string(), // userId
  role: z.enum(["ADMIN", "DOCTOR", "ASSISTANT", "PATIENT"]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type AuthUser = {
  id: string;
  role: "ADMIN" | "DOCTOR" | "ASSISTANT" | "PATIENT";
};

// ✅ Ajout du type req.user à Express
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * ✅ Extraction du token depuis:
 * 1) Authorization: Bearer <token>
 * 2) cookie "access_token" (si tu utilises les cookies)
 */
function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  // optionnel: token en cookie (si cookie-parser est utilisé)
  const cookieToken = (req as any).cookies?.access_token;
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * ✅ AUTH MIDDLEWARE
 * Vérifie JWT, et injecte req.user
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token manquant. Connecte-toi.",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        error: "ServerError",
        message: "JWT_SECRET manquant dans .env",
      });
    }

    const decoded = jwt.verify(token, secret);
    const parsed = JwtPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token invalide (payload incorrect).",
      });
    }

    req.user = {
      id: parsed.data.sub,
      role: parsed.data.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token invalide ou expiré.",
    });
  }
}

/**
 * ✅ AUTHORIZATION (ROLE-BASED ACCESS)
 * Exemple: requireRole("DOCTOR") ou requireRole("ADMIN","ASSISTANT")
 */
export function requireRole(...allowedRoles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Non authentifié.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Accès refusé. Rôle requis: ${allowedRoles.join(" / ")}`,
      });
    }

    next();
  };
}
