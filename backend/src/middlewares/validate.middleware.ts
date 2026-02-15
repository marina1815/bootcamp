import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";

/**
 * ======================================================
 * 🔹 Validate Request Body
 * ======================================================
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);

      // Replace body with validated & transformed data
      req.body = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        
        console.error("❌ Validation Error:", JSON.stringify(errors, null, 2));

        return res.status(400).json({
          error: "Validation error",
          details: errors,
        });
      }

      next(error);
    }
  };
}

/**
 * ======================================================
 * 🔹 Validate Request Query
 * ======================================================
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);

      req.query = parsed as Request["query"];

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return res.status(400).json({
          error: "Query validation error",
          details: errors,
        });
      }

      next(error);
    }
  };
}

/**
 * ======================================================
 * 🔹 Validate Request Params (ex: /users/:id)
 * ======================================================
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);

      req.params = parsed as Request["params"];


      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return res.status(400).json({
          error: "Params validation error",
          details: errors,
        });
      }

      next(error);
    }
  };
}
