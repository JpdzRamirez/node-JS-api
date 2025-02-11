import { APPUser } from "../models/UserModel";
import { UserController } from "../controllers/UserController";
import { UserRepository } from "../repository/UserRepository";
import { supabaseAnon, supabaseAdmin } from "../config/SupabaseClient";
import { LoginData, RegisterData } from "../types";
import bcrypt from "bcryptjs";

class AuthService {
  /*
      Global repositorys query
  */
  private static userController = new UserController();

  private static userRepository = new UserRepository();

  static async register(data: RegisterData): Promise<APPUser | null> {
    try {
      data.password = await bcrypt.hash(data.password, 10);
      data.role_id = 2;

      return await this.userController.createUser(data);
    } catch (error: any) {
      throw error;
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
      const userTable = await this.userRepository.getUserById(user.id); // Usar await aquí

      if (!userTable) {
        throw new Error("Error al obtener información del usuario");
      }

      // Devolver el token y la información del usuario
      return {
        token,
        user: {
          id: user.id,
          document: userTable.document, // Ahora puedes acceder a las propiedades
          email: user.email || "",
          name: userTable.name,
          lastname: userTable.lastname,
          role_id: userTable.role_id,
          phone: userTable.phone,
          mobile: userTable.mobile,
          created_at: userTable.created_at,
          updated_at: userTable.updated_at,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }
}

export default AuthService;
