import { supabaseAnon, supabaseAdmin } from "../config/SupabaseClient";
import { APPUser } from "../models/UserModel";

export class UserRepository {
  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(id: string): Promise<APPUser | null> {
    try {
      const { data, error } = await supabaseAnon
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener el usuario:", error);
        return null;
      }

      if (!data) {
        console.log(`Usuario con id ${id} no encontrado.`);
        return null;
      }

      return data as APPUser;
    } catch (error) {
      throw error;
    }
  }

  /*Get by Email*/
  async findByEmail(email: string): Promise<APPUser | null> {
    try {
      const { data, error } = await supabaseAnon
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle(); // ⚡️ Evita error si no hay resultados

      if (error) {
        console.error("Error al obtener el usuario:", error);
        return null;
      }

      if (!data) {
        console.log(`Usuario con email ${email} no encontrado.`);
        return null;
      }

      return data as APPUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<APPUser[]> {
    try {
      const { data, error } = await supabaseAnon.from("users").select("*");

      if (error) {
        console.error("Error al obtener usuarios:", error);
        return [];
      }

      return data as APPUser[];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(user: Partial<APPUser>): Promise<APPUser | null> {
    try {
      // Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Confirmar el correo automáticamente
        user_metadata: {
          document: user.document,
          name: user.name,
          lastname: user.lastname,
          role_id: user.role_id,
          phone: user.phone,
          mobile: user.mobile,
        },
      });

      if (authError) {
        console.error("Error al crear el usuario en Supabase Auth:", authError);
        return null;
      }
      // Insertar el usuario en la tabla `users`
      const { data: dbData, error: dbError } = await supabaseAdmin
        .from("users")
        .insert([{
          id: authData.user.id,
          document: user.document,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          role_id: user.role_id,
          phone: user.phone,
          mobile: user.mobile,
        }])
        .select()
        .single();

      if (dbError) {
        console.error("Error al insertar el usuario en la base de datos:", dbError);
        return null;
      }

      return dbData as APPUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un usuario por su ID
   */
  async updateUser(
    id: string,
    user: Partial<APPUser>
  ): Promise<APPUser | null> {
    // Agregar la fecha de actualización
    user.updated_at = new Date();
    try {
      // Actualizar
      const { data, error } = await supabaseAdmin
        .from("users")
        .update(user)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error al actualizar el usuario:", error);
        return null;
      }

      return data as APPUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un usuario por su ID
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.from("users").delete().eq("id", id);

      if (error) {
        console.error("Error al eliminar el usuario:", error);
        return false;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}
