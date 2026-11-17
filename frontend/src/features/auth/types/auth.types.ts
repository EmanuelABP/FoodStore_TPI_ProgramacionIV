export interface UsuarioAuth {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string | null;
  roles: string[];
  deleted_at: string | null;
}

export interface LoginDatos {
  email: string;
  password: string;
}

export interface RegistroDatos extends LoginDatos {
  nombre: string;
  apellido: string;
  celular?: string;
}
