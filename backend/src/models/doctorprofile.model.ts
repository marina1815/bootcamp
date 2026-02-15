// src/models/doctorProfile.model.ts


export type DoctorSpeciality =
  | "medecine-generale"
  | "cardiologie"
  | "dermatologie"
  | "pediatrie"
  | "gynecologie"
  | "psychiatrie"
  | "ophtalmologie"
  | "oto-rhino"
  | "chirurgie"
  | "radiologie"
  | "anesthesie"
  | "endocrinologie";

export interface DoctorProfile {
  id: string;

  user_id: string;             

  speciality: DoctorSpeciality;

  license_number: string;

  clinic_address?: string;

  phone?: string;

  created_at: string;
  updated_at: string;
}




