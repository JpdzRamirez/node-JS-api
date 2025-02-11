export interface APPUser {
  id: string;
  id_authToken:string,
  document:string;
  email: string;
  password?: string; 
  name:string;
  lastname:string;
  role_id:number;
  phone:string;
  mobile?:string;
  address?:string;
  created_at?: Date; // Si Supabase almacena la fecha de creación
  updated_at?: Date; // Si manejas fecha de actualización
}

