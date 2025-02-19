import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from "../config/SupabaseClient";
import { APPUser } from '../models/UserModel'; // Ajusta la ruta si es necesario

// Extender `AuthRequest` para incluir el usuario completo
export interface AuthRequest extends Request {
  user?: APPUser;
  authToken?: string;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    req.authToken = token;
    // Verificar token con Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      res.status(401).json({ message: 'Usuario no autenticado o token inválido' });
      return;
    }

    // Obtener el ID del usuario autenticado
    const userId = authData.user.id;

    // Buscar el rol en la tabla `public.users`
    const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, roles:roles!users_role_id_fkey(id, name)') // Usamos el alias correcto
    .eq('uuid_authSupa', userId)
    .single();
  
  

      if (error) {
        throw new Error("No se encontraron roles para este usuario.");
      }
      
    // Mapear los datos a la interfaz `APPUser`
    const user: APPUser = {
      id: data.id,
      uuid_authSupa: data.uuid_authSupa,
      document: data.document,
      email: data.email,
      name: data.name,
      lastname: data.lastname,
      role_id: data.role_id,
      phone: data.phone,
      mobile: data.mobile,
      address: data.address,
      created_at: data.created_at,
      updated_at: data.updated_at,
      roles: data.roles ? { id: data.roles.id, name: data.roles.name } : null,
    };
    // Guardar el usuario autenticado en `req.user`
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(401).json({ message: error });
  }
};



