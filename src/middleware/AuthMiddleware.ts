import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from "../config/SupabaseClient";
import { APPUser } from "../models/UserModel";
export interface AuthRequest extends Request {
  user?: { id: string; role_id: string };
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verificar token con Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      res.status(401).json({ message: 'Usuario no autenticado o token inválido' });
      return;
    }

    // Obtener el ID del usuario autenticado
    const userId = authData.user.id;

    // Buscar el rol en la tabla `public.users`
    const { data: data, error: roleError } = await supabaseAdmin
      .from('users')
      .select('id, roles(id)')
      .eq('uuid_authSupa', userId)
      .single();

    if (roleError || !data || !data.roles) {
      res.status(403).json({ message: 'No se pudo obtener el rol del usuario' });
      return;
    }

    if (!data || !data.roles || data.roles.length === 0) {
      throw new Error("No se encontraron roles para este usuario.");
    }
    
    const roleId = data.roles?.id;

    if (!roleId) {
      res.status(403).json({ message: 'El usuario no tiene un rol asignado' });
      return;
    }

    req.user = { id: userId, role_id: roleId };
    
    next();
  } catch (err) {
    console.error('Error en la autenticación:', err);
    res.status(401).json({ message: 'Token inválido' });
  }
};



