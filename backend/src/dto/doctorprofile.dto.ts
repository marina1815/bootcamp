import { z } from "zod";

const normalizeText = (v: string) => v.trim().replace(/\s+/g, " ");

const PhoneSchema = z.string()
  .trim()
  .min(6)
  .max(20)
  .regex(/^[0-9+\s-]+$/, { message: "Téléphone invalide" });

export const DoctorSpecialitySchema = z.enum([
  "medecine-generale",
  "cardiologie",
  "dermatologie",
  "pediatrie",
  "gynecologie",
  "psychiatrie",
  "ophtalmologie",
  "oto-rhino",
  "chirurgie",
  "radiologie",
  "anesthesie",
  "endocrinologie",
]);

export const CreateDoctorProfileSchema = z.object({
  // ⚠️ Idem : userId idéalement depuis JWT (docteur connecté)
  // userId: z.string().uuid(),

  speciality: DoctorSpecialitySchema,

  // si "autre" => tu peux demander un texte:
  otherSpeciality: z.string().min(2).max(60).transform(normalizeText).optional(),

  license_number: z.string().min(4).max(40).transform(normalizeText),

  clinic_address: z.string().max(200).transform(normalizeText).optional(),
  phone: PhoneSchema.optional(),
  bio: z.string().max(400).transform(normalizeText).optional(),
})
.strict()
.superRefine((data, ctx) => {
  // ✅ Validation conditionnelle pro
 
});

export type CreateDoctorProfileDTO = z.infer<typeof CreateDoctorProfileSchema>;

export const UpdateDoctorProfileSchema = CreateDoctorProfileSchema
  .omit({ license_number: true }) // souvent on évite de changer le numéro pro
  .partial()
  .strict();

export type UpdateDoctorProfileDTO = z.infer<typeof UpdateDoctorProfileSchema>;
