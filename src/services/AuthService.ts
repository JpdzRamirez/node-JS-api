import { APPUser } from "../models/UserModel";
import { UserController } from "../controllers/UserController";
import { UserRepository } from "../repository/UserRepository";
import { supabaseAdmin } from "../config/SupabaseClient";
import { LoginData } from "../types";

class AuthService {
  /*
      Global repositorys query
  */
  private static userController = new UserController();

  private static userRepository = new UserRepository();

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
      const { data: sessions, error: sessionError } = await supabaseAdmin
        .from('auth.sessions')
        .select('id')
        .eq('user_id', userId);
  
      if (sessionError) {
        console.error("❌ Error al obtener sesiones:", sessionError);
        return false;
      }
  
      if (!sessions || sessions.length === 0) {
        console.warn("⚠️ No hay sesiones activas para cerrar.");
        return true;
      }
  
      // ❌ Eliminar todas las sesiones activas del usuario
      const { error: deleteError } = await supabaseAdmin
        .from('auth.sessions')
        .delete()
        .eq('user_id', userId);
  
      if (deleteError) {
        console.error("❌ Error al cerrar sesión en Supabase:", deleteError);
        return false;
      }
  
      return true;
    } catch (error) {
      console.error("❌ Error interno en logout:", error);
      return false;
    }
  };

  static async login(
    data: LoginData
  ): Promise<{ token: string; user: APPUser } | null> {
    try {
      // 🔹 Buscar al usuario en `auth.users` por email
      const { data: userAuth, error: userAuthError } = await supabaseAdmin
        .from("auth.users")
        .select("id, email")
        .eq("email", data.email)
        .single();

      if (userAuthError || !userAuth) {
        throw new Error("Usuario no encontrado en Supabase Auth");
      }

      const userId = userAuth.id;

      // Eliminar todas las sesiones previas del usuario
      await supabaseAdmin.from('auth.sessions').delete().eq('user_id', userId);

      // Iniciar sesión con Supabase
      const { data: authData, error } =
        await supabaseAdmin.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Obtener el usuario autenticado
      const user = authData.user;
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Obtener el token de sesión
      const token = authData.session?.access_token;
      if (!token) {
        throw new Error("No se pudo generar el token");
      }

      // Obtener información adicional del usuario desde la tabla `users`
      const userTable = await this.userRepository
        .findByEmail(user.email as string)
        .then((user) => {
          console.log("🟢 Usuario obtenido:", user);
          return user;
        })
        .catch((error) => {
          console.error("❌ Error en findByEmail:", error);
          return null;
        });

      if (!userTable) {
        throw new Error("Error al obtener información del usuario");
      }

      // Devolver el token y la información del usuario
      return {
        token,
        user: {
          id: userTable.id,
          uuid_authSupa: user.id,
          document: userTable.document,
          email: user.email || "",
          name: userTable.name,
          lastname: userTable.lastname,
          role_id: userTable.role_id,
          phone: userTable.phone,
          mobile: userTable.mobile,
          created_at: userTable.created_at,
          updated_at: userTable.updated_at,
          roles: userTable.roles
            ? {
                // Verifica si la relación existe antes de acceder
                id: userTable.roles.id,
                name: userTable.roles.name,
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
