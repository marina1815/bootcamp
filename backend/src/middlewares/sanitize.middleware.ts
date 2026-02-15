import type { Request, Response, NextFunction } from "express";

function cleanString(value: string): string {
  return value
    .replace(/\u0000/g, "")     
    .trim()
    .replace(/\s+/g, " ");    
}

function deepSanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") return cleanString(obj);

  if (Array.isArray(obj)) return obj.map(deepSanitize);

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, val] of Object.entries(obj)) {
      sanitized[key] = deepSanitize(val);
    }
    return sanitized;
  }

  return obj;
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = deepSanitize(req.body);
  }
  next();
}

export function sanitizeQuery(req: Request, _res: Response, next: NextFunction) {
  if (req.query && typeof req.query === "object") {
    req.query = deepSanitize(req.query);
  }
  next();
}
