import { Response, NextFunction } from 'express';
import { supabaseAdmin } from "../config/SupabaseClient";
import { UserController } from "../controllers/UserController";
import { AuthRequest } from "../types";
import { APPUser } from "../models/auth/User.entity";

// Extender `AuthRequest` para incluir el usuario completo

const userController = new UserController();
// ✅
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

    if (authError || !authData.user || !authData.user.email) {
      throw new Error("Usuario no autenticado o token inválido");
    }        

    // Buscar el rol en la tabla `public.users`
    const complementaryDataUser = await userController.getUserByEmail(authData.user.email);
  
    if (!complementaryDataUser) {
      res.status(404).json({ message: "No se encontraro usuario autenticado" });
      return;        
    }
      
    // 🔹 3. Mapear los datos al modelo `APPUser`
    const user: APPUser = {
      id: complementaryDataUser.id,
      uuid_authsupa: complementaryDataUser.uuid_authsupa,
      schema_id: complementaryDataUser.schema_id,
      document: complementaryDataUser.document,
      email: complementaryDataUser.email,
      password: "", // 🔹 No devolver la contraseña por seguridad
      name: complementaryDataUser.name,
      lastname: complementaryDataUser.lastname,
      phone: complementaryDataUser.phone,
      mobile: complementaryDataUser.mobile,
      address: complementaryDataUser.address,
      created_at: complementaryDataUser.created_at,
      updated_at: complementaryDataUser.updated_at,
      roles: complementaryDataUser.roles ? { id: complementaryDataUser.roles.id, name: complementaryDataUser.roles.name } : null,
    };
    // Guardar el usuario autenticado en `req.user`
    req.user = user;

    next();
  } catch (error:any) {
    console.error('Error en la autenticación:', error);
    res.status(401).json({ error: error.message });
    return;    
  }
};



