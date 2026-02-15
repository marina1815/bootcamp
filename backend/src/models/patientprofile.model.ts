export type Sexe =
  | "homme"
  | "femme";
  
  
  export interface PatientProfile {
  id: string;

  user_id: string;            

  age?: number;      
  phone?: string;
  sexe?: Sexe;

  created_at: string;
  updated_at: string;
}

