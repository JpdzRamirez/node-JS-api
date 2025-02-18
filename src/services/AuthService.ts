import { APPUser } from "../models/UserModel";
import { UserController } from "../controllers/UserController";
import { supabaseAdmin } from "../config/SupabaseClient";
import { LoginData } from "../types";

class AuthService {
  /*
      Global repositorys query
  */
  private static userController = new UserController();
  

  static async userBuilder(data: Partial<APPUser>): Promise<any> {
    try {
      const user = await this.userController.createUser(data);

      if (!user) {
        throw new Error("No se pudo crear el usuario");
      }

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async logout(userId: string): Promise<boolean> {
    try {
      // 🔍 Buscar las sesiones activas del usuario en `auth.sessions`      
      const { error } = await supabaseAdmin.auth.admin.signOut(userId);
      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (error) {
      console.error("❌ Error interno en logout:", error);
      return false;
    }
  }

  static async login(
    data: LoginData
  ): Promise<{ token: string; user: APPUser } | null> {
    try {
      // Iniciar sesión con Supabase
      const { data: authData, error } =
        await supabaseAdmin.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
      if (error) {
        throw new Error(error.message);
      }
      // Obtener el token de sesión
      const token = authData.session?.access_token;
      if (!token) {
        throw new Error("Error de Integracion: Error generar token");
      }
      // Cerrar sesiónes anteriores a la actual del usuario autenticado
      await supabaseAdmin.auth.signOut({ scope: "others" });

      // 🔹 Buscar al usuario en `users` por email para traer datos complementarios
      const complementaryDataUser = await this.userController.getUserByEmail(
        authData.user.email as string
      );

      if (!complementaryDataUser) {
        throw new Error("Usuario no encontrado en users.auth");
      }

      // Devolver el token y la información del usuario
      return {
        token,
        user: {
          id: complementaryDataUser.id,
          uuid_authSupa: authData.user.id,
          document: complementaryDataUser.document,
          email: authData.user.email || "",
          name: complementaryDataUser.name,
          lastname: complementaryDataUser.lastname,
          role_id: complementaryDataUser.role_id,
          phone: complementaryDataUser.phone,
          mobile: complementaryDataUser.mobile,
          created_at: complementaryDataUser.created_at,
          updated_at: complementaryDataUser.updated_at,
          roles: complementaryDataUser.roles
            ? {
                // Verifica si la relación existe antes de acceder
                id: complementaryDataUser.roles.id,
                name: complementaryDataUser.roles.name,
              }
            : null,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }
}

export default AuthService;
