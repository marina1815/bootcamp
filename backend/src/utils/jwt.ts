import jwt from "jsonwebtoken";
import { z } from "zod";

const JwtPayloadSchema = z.object({
  sub: z.string(), 
  role: z.enum(["ADMIN", "DOCTOR", "PATIENT"]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JwtUser = {
  id: string;
  role: "ADMIN" | "DOCTOR"  | "PATIENT";
};

export function signAccessToken(user: JwtUser): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  if (!secret) throw new Error("JWT_SECRET missing");

  return jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: expiresIn as any }
  );
}

export function verifyAccessToken(token: string): JwtUser {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");

  const decoded = jwt.verify(token, secret);
  const parsed = JwtPayloadSchema.safeParse(decoded);
  if (!parsed.success) throw new Error("Invalid token payload");

  return { id: parsed.data.sub, role: parsed.data.role };
}
