import { supabaseAnon, supabaseAdmin } from "../config/SupabaseClient";
import { Client } from 'pg';
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
      .eq("id_authToken", id) // Buscar por id_authToken
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
        .maybeSingle(); 

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
    const client = new Client({
      connectionString: process.env.DATABASE_URL, // Cadena de conexión de PostgreSQL
    });

    await client.connect();

    try {
      // Iniciar transacción
      await client.query('BEGIN');

      // Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        phone: user.mobile,
        email: user.email,
        password: user.password as string,
        email_confirm: true, // Confirmar el correo automáticamente
        user_metadata: {
          display_name: `${user.name} ${user.lastname}`,
          document: user.document,
          name: user.name,
          lastname: user.lastname,
          role_id: user.role_id,
          phone: user.mobile,
          mobile: user.mobile,
        },
      });

      if (authError) {
        throw new Error(`Error al crear el usuario en Supabase Auth: ${authError.message}`);
      }

      // Insertar el usuario en la tabla `users`
      const insertUserQuery = `
        INSERT INTO users (id_authToken, document, email, name, lastname, role_id, phone, mobile, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const { rows } = await client.query(insertUserQuery, [
        authData.user.id,
        user.document,
        user.email,
        user.name,
        user.lastname,
        user.role_id,
        user.phone,
        user.mobile,
        user.address,
      ]);

      // Confirmar transacción
      await client.query('COMMIT');

      return rows[0] as APPUser;
    } catch (error: any) {
      // Revertir transacción en caso de error
      await client.query('ROLLBACK');
      console.error("Error en la transacción:", error.message);
      throw error;
    } finally {
      // Cerrar conexión
      await client.end();
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
