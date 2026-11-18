export type Role = "user" | "admin";

export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  disabled: boolean;
  created_at: string;
}

export interface LoginDatos {
  username: string;
  password: string;
}

export interface UserCreate extends LoginDatos {
  full_name: string;
  email: string;
}
