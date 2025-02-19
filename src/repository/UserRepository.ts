import { supabaseAnon, supabaseAdmin } from "../config/SupabaseClient";
import postgreSQLPOOL from "../config/PostgreSQLClient";
import { APPUser } from "../models/UserModel";

import bcrypt from "bcryptjs";

export class UserRepository {
  
  /** ✅
   * Obtiene un usuario por su ID
   */
  async getUserById(id: Number): Promise<APPUser | null> {
    const client = await postgreSQLPOOL.connect(); // 🟢 Obtener conexión del pool
    try {
      await client.query("BEGIN"); // 🔹 Iniciar transacción

      const res = await client.query(
        `
        SELECT 
          users.*, 
          json_build_object(
            'id', roles.id,
            'name', roles.name              
          ) AS roles
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
        LIMIT 1;
      `,
        [id]
      );

      // 🔹 Confirmar transacción
      await client.query("COMMIT"); 

      return res.rows.length > 0 ? res.rows[0] : null;

    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Deshacer cambios en caso de error
      console.error("❌ Error en la transacción:", error);
      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión para otros procesos
    }
  }

  /*✅
  Get by Email
  */
  async findByEmail(email: string): Promise<APPUser | null> {
    const client = await postgreSQLPOOL.connect(); // 🟢 Obtener conexión del pool
    try {
      await client.query("BEGIN"); // 🔹 Iniciar transacción

      const result = await client.query(
        `
      SELECT 
        users.*, 
        json_build_object(
            'id', roles.id,
            'name', roles.name              
          ) AS roles
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE users.email = $1
        LIMIT 1;
      `,
        [email]
      );

      await client.query("COMMIT"); // 🔹 Confirmar transacción

      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Deshacer cambios en caso de error
      console.error("❌ Error en la transacción:", error);
      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión para otros procesos
    }
  }

  /**✅
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<APPUser[]> {
    const client = await postgreSQLPOOL.connect(); // 🟢 Obtener conexión del pool
    try {
      await client.query("BEGIN"); // 🔹 Iniciar transacción

      const result = await client.query(
        `
        SELECT 
        users.*, 
        json_build_object(
            'id', roles.id,
            'name', roles.name              
        ) AS roles
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id;
      `
      );

      await client.query("COMMIT"); // 🔹 Confirmar transacción

      return result.rows;

    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Deshacer cambios en caso de error
      console.error("❌ Error en la transacción:", error);
      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión para otros procesos
    }
  }

  /**✅
   * Crea un nuevo usuario
   */
  async createUser(user: Partial<APPUser>): Promise<APPUser | null> {
    const client = await postgreSQLPOOL.connect(); 
    let authUserId: string | null = null; 

    try {
      await client.query("BEGIN"); // 🔹 Iniciar transacción en `public.users`

      // 🔹 Crear usuario en Supabase Auth
      const { data: data, error: error } = await supabaseAdmin.auth.admin.createUser({
        phone: user.mobile ?? "",
        email: user.email ?? "",
        password: user.password as string,
        email_confirm: true,
        user_metadata: {
          display_name: `${user.name ?? ""} ${user.lastname ?? ""}`,
          document: user.document ?? "",
          name: user.name ?? "",
          lastname: user.lastname ?? "",
          role_id: user.role_id ?? 0,
          phone: user.mobile ?? "",
          mobile: user.mobile ?? "",
          address:user.address?? "",
        },
      });

      if (error || !data?.user) {
        throw new Error(
          `Error en Supabase Auth: ${
            error?.message || "No se pudo crear el usuario"
          }`
        );
      }
      authUserId=data.user.id;      

      // 🔹 Insertar usuario en `public.users`
      const insertQuery = `
        INSERT INTO users (uuid_authsupa, document, email, name, lastname, role_id, phone, mobile, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;

      const values = [
        authUserId,
        user.document ?? "",
        user.email ?? "",
        user.name ?? "",
        user.lastname ?? "",
        user.role_id ?? 2,
        user.phone ?? "",
        user.mobile ?? "",
        user.address ?? "",        
      ];

      const result = await client.query(insertQuery, values);

      if (result.rows.length === 0) {
        throw new Error("No se pudo crear el usuario en la base de datos.");
      }

      await client.query("COMMIT"); // 🔹 Confirmar transacción en `public.users`
      
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Revertir cambios en `public.users`

      console.error("❌ Error al crear usuario:", error);

      if (authUserId) {
        // 🔹 Si la transacción en `public.users` falló, eliminar usuario en `auth.users`
        console.log("🗑 Eliminando usuario en auth.users...");
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }

      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión
    }
  }

  /**✅
   * Actualiza un usuario por su ID
   */
  async updateUser(
    id: Number,
    user: Partial<APPUser>
  ): Promise<APPUser | null> {
    const client = await postgreSQLPOOL.connect();

    try {
      await client.query("BEGIN"); // Inicia la transacción

      // 🔹 1. Actualizar `public.users`
      user.updated_at = new Date(); // Agregar la fecha de actualización

      const fields = Object.keys(user)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(", ");
      const values = Object.values(user);

      const { rows: updatedUserData } = await client.query(
        `UPDATE users SET ${fields} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );

      if (updatedUserData.length === 0) {
        throw new Error("No se pudo actualizar el usuario en public.users.");
      }

      const updatedUser = updatedUserData[0];

      // 🔹 2. Actualizar `auth.users` en Supabase
      const authUpdates = {
        email: updatedUser.email,
        password: updatedUser.password,
        phone: updatedUser.phone,
        updatedUser_metadata: {
          display_name: `${updatedUser.name ?? ""} ${updatedUser.lastname ?? ""}`,
          document: updatedUser.document,
          name: updatedUser.name,
          lastname: updatedUser.lastname,
          role_id: updatedUser.role_id,
          phone: updatedUser.phone,
          mobile: updatedUser.mobile,
          address: updatedUser.address,
        },
      };

      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(
          updatedUser.uuid_authsupa,
          authUpdates
        );

      if (authError) {
        throw new Error(
          `Error al actualizar en auth.users: ${authError.message}`
        );
      }

      // 🔹 Confirmar la transacción
      await client.query("COMMIT"); 

      return updatedUser; // Retornar el usuario actualizado

    } catch (error) {
      await client.query("ROLLBACK"); // Revertir la transacción en caso de error
      console.error("Error al actualizar usuario:", error);
      throw error;
    } finally {
      client.release(); // Liberar el cliente de la pool
    }
  }

  /**✅
   * Elimina un usuario por su ID
   */
  async deleteUser(id: Number): Promise<boolean> {
    const client = await postgreSQLPOOL.connect(); // 🔹 Conectar al pool de PostgreSQL
    try {
      await client.query("BEGIN"); // 🔹 Iniciar transacción

      // 🔹 Obtener el ID de auth antes de eliminar el usuario en public.users
      const  result  = await client.query(
        `SELECT id, uuid_authsupa FROM public.users WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const authUserId = result.rows[0].uuid_authsupa;

      // 🔹 Eliminar usuario de public.users
      const deleteQuery = `DELETE FROM users WHERE id = $1`;

      const resultDelete = await client.query(deleteQuery, [id]);      

      if (resultDelete.rowCount === 0) {
        return false; 
      }

      // 🔹 Intentar eliminar el usuario de auth.users
      const { error: error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

      if (error) {
        throw new Error(`Error al eliminar usuario en auth.users: ${error.message}`);
      }

      await client.query("COMMIT"); // 🔹 Confirmar transacción en `public.users`

      return true;

    } catch (error) {
      // 🔹 Revertir transacción si falla
      await client.query("ROLLBACK"); 
      console.error("❌ Error eliminando usuario:", error);
      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión
    }
  }
}
