
export type AppointmentStatus = "SCHEDULED" | "CANCELLED" | "DONE";

export interface Appointment {
  id: string;

  patient_id: string;          // FK → User.id (role = PATIENT)
  doctor_id: string;           // FK → User.id (role = DOCTOR)

  date_time: string;          
  status: AppointmentStatus;

  reason?: string;           
  notes?: string;           

  created_at: string;
  updated_at: string;
}


