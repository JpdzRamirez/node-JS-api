export interface APPUser {
  id: string;
  email: string;
  password?: string; // Normalmente no se almacena ni se devuelve desde la API
  role: string;
  created_at?: string; // Si Supabase almacena la fecha de creación
  updated_at?: string; // Si manejas fecha de actualización
}
