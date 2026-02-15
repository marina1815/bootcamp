export type Sexe =
  | "homme"
  | "femme";
  
  
  export interface PatientProfile {
  id: string;

  user_id: string;             // FK → User.id (role = PATIENT)

  age?: number;      
  phone?: string;
  sexe?: Sexe;

  created_at: string;
  updated_at: string;
}

