
export type AppointmentStatus = "SCHEDULED" | "CANCELLED" | "DONE";

export interface Appointment {
  id: string;

  patient_id: string;      
  doctor_id: string;         

  date_time: string;          
  status: AppointmentStatus;

  reason?: string;           
  notes?: string;           

  created_at: string;
  updated_at: string;
}


