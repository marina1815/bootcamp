export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export interface User {
  id: string;                
  first_name: string;
  last_name: string;
  email: string;

  password_hash: string;      
  role: UserRole;

  created_at: string;         
  updated_at: string;
}

export type PublicUser = Omit<User, "passwordHash">;



