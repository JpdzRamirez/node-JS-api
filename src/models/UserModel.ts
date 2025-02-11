export interface APPUser {
  id: string;
  document:string;
  email: string;
  password?: string; // Normalmente no se almacena ni se devuelve desde la API
  name:string;
  lastname:string;
  role_id:number;
  phone:string;
  mobile?:string;
  created_at?: Date; // Si Supabase almacena la fecha de creación
  updated_at?: Date; // Si manejas fecha de actualización
}
