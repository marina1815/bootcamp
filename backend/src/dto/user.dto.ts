import { z } from "zod";

const normalizeText = (v: string) =>
  v.trim().replace(/\s+/g, " "); 

const normalizeEmail = (v: string) =>
  v.trim().toLowerCase();

export const UserRoleSchema = z.enum(["ADMIN", "DOCTOR", "PATIENT"]);


export const RegisterSchema = z.object({
  first_name: z.string().min(2).max(30).transform(normalizeText),
  last_name: z.string().min(2).max(30).transform(normalizeText),
  email: z.string().email().transform(normalizeEmail),

  password: z.string()
    .min(8, "Min 8 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
      message: "Maj + min + chiffre + symbole requis",
    }),

  role: UserRoleSchema,
  
  // Optional profile fields
  phone: z.string().optional(),
  speciality: z.string().optional(),
  license_number: z.string().optional(),
  clinic_address: z.string().optional(),
  gender: z.string().optional(),
  age: z.union([z.string(), z.number()]).optional(),
}).passthrough(); 

export type RegisterDTO = z.infer<typeof RegisterSchema>;

// LOGIN
export const LoginSchema = z.object({
  email: z.string().email().transform(normalizeEmail),
  password: z.string().min(1, "Mot de passe requis"),
}).strict();

export type LoginDTO = z.infer<typeof LoginSchema>;
