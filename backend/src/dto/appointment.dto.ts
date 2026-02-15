import { z } from "zod";

const normalizeText = (v: string) => v.trim().replace(/\s+/g, " ");

export const AppointmentStatusSchema = z.enum(["SCHEDULED", "CANCELLED", "DONE"]);

const IsoDateTimeSchema = z.string().datetime({ message: "dateTime doit être un ISO datetime valide" });


export const CreateAppointmentAsPatientSchema = z.object({
  doctorId: z.string().uuid(),
  dateTime: IsoDateTimeSchema,
  reason: z.string().max(200).transform(normalizeText).optional(),
}).strict();

export type CreateAppointmentAsPatientDTO = z.infer<typeof CreateAppointmentAsPatientSchema>;

export const CreateAppointmentAsStaffSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  dateTime: IsoDateTimeSchema,
  reason: z.string().max(200).transform(normalizeText).optional(),
}).strict();

export type CreateAppointmentAsStaffDTO = z.infer<typeof CreateAppointmentAsStaffSchema>;

export const UpdateAppointmentStatusSchema = z.object({
  status: AppointmentStatusSchema,
  notes: z.string().max(400).transform(normalizeText).optional(),
}).strict();

export type UpdateAppointmentStatusDTO = z.infer<typeof UpdateAppointmentStatusSchema>;
