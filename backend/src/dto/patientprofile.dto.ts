import { z } from "zod";

export const SexeSchema = z.enum(["homme", "femme"]);

const PhoneSchema = z.string()
  .trim()
  .regex(/^[0-9+\s-]{6,20}$/, "Numéro invalide");

export const CreatePatientProfileSchema = z.object({

  age: z.number()
    .int()
    .min(0, "Age invalide")
    .max(120, "Age invalide")
    .optional(),

  phone: PhoneSchema.optional(),

  sexe: SexeSchema.optional(),

}).strict();

export type CreatePatientProfileDTO =
  z.infer<typeof CreatePatientProfileSchema>;
