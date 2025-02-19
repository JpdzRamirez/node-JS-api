import { supabaseAnon, supabaseAdmin } from "../config/SupabaseClient";
import postgreSQLPOOL from "../config/PostgreSQLClient";
import { APPUser } from "../models/UserModel";

import bcrypt from "bcryptjs";

export class UserRepository {
  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(id: string): Promise<APPUser | null> {
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
          ) AS role
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
        LIMIT 1;
      `,
        [id]
      );

      if (res.rows.length === 0) {
        throw new Error("No se encontró usuario.");
      }

      await client.query("COMMIT"); // 🔹 Confirmar transacción
      return res.rows[0];
    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Deshacer cambios en caso de error
      console.error("❌ Error en la transacción:", error);
      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión para otros procesos
    }
  }

  /*Get by Email*/
  async findByEmail(email: string): Promise<APPUser | null> {
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
        WHERE users.email = $1
        LIMIT 1;
      `,
        [email]
      );

      if (res.rows.length === 0) {
        throw new Error("No se encontró usuario.");
      }

      await client.query("COMMIT"); // 🔹 Confirmar transacción
      return res.rows[0];
    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Deshacer cambios en caso de error
      console.error("❌ Error en la transacción:", error);
      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión para otros procesos
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<APPUser[]> {
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
        ) AS role
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        LIMIT 1;
      `
      );

      if (res.rows.length === 0) {
        throw new Error("No se encontró usuario.");
      }

      await client.query("COMMIT"); // 🔹 Confirmar transacción

      return res.rows[0];
    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Deshacer cambios en caso de error
      console.error("❌ Error en la transacción:", error);
      throw error;
    } finally {
      client.release(); // 🔹 Liberar conexión para otros procesos
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(user: Partial<APPUser>): Promise<APPUser | null> {
    const client = await postgreSQLPOOL.connect(); // 🔹 Conexión al pool de PostgreSQL
    let authUserId: string | null = null; // ✅ Definir authUserId fuera del try

    try {
      await client.query("BEGIN"); // 🔹 Iniciar transacción en `public.users`

      // 🔹 Crear usuario en Supabase Auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
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
        },
      });

      if (error || !data?.user) {
        throw new Error(
          `Error en Supabase Auth: ${
            error?.message || "No se pudo crear el usuario"
          }`
        );
      }

      authUserId = data.user.id;

      // 🔹 Hashear la contraseña antes de guardar en `public.users`
      user.password = user.password ? await bcrypt.hash(user.password, 10) : "";

      // 🔹 Insertar usuario en `public.users`
      const insertQuery = `
        INSERT INTO public.users (id_authtoken, document, email, name, lastname, role_id, phone, mobile, address, password)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        user.password ?? "",
      ];

      const result = await client.query(insertQuery, values);

      if (result.rows.length === 0) {
        throw new Error("No se pudo crear el usuario en la base de datos.");
      }

      await client.query("COMMIT"); // 🔹 Confirmar transacción en `public.users`
      return result.rows[0];
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

  /**
   * Actualiza un usuario por su ID
   */
  async updateUser(
    id: string,
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
        email: user.email,
        password: user.password,
        phone: user.mobile,
        user_metadata: {
          display_name: `${user.name ?? ""} ${user.lastname ?? ""}`,
          document: user.document,
          name: user.name,
          lastname: user.lastname,
          role_id: user.role_id,
          phone: user.mobile,
          mobile: user.mobile,
        },
      };

      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(
          updatedUser.uuid_authSupa,
          authUpdates
        );

      if (authError) {
        throw new Error(
          `Error al actualizar en auth.users: ${authError.message}`
        );
      }

      await client.query("COMMIT"); // Confirmar la transacción
      return updatedUser; // Retornar el usuario actualizado
    } catch (error) {
      await client.query("ROLLBACK"); // Revertir la transacción en caso de error
      console.error("Error al actualizar usuario:", error);
      return null;
    } finally {
      client.release(); // Liberar el cliente de la pool
    }
  }

  /**
   * Elimina un usuario por su ID
   */
  async deleteUser(id: string): Promise<boolean> {
    const client = await postgreSQLPOOL.connect(); // 🔹 Conectar al pool de PostgreSQL
    try {
      await client.query("BEGIN"); // 🔹 Iniciar transacción

      // 🔹 Obtener el ID de auth antes de eliminar el usuario en public.users
      const { rows } = await client.query(
        "SELECT id_authtoken FROM public.users WHERE id = $1",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Usuario no encontrado en base de datos");
      }

      const authUserId = rows[0].uuid_authSupa;

      // 🔹 Eliminar usuario de public.users
      const deleteQuery = "DELETE FROM public.users WHERE id = $1";
      await client.query(deleteQuery, [id]);

      await client.query("COMMIT"); // 🔹 Confirmar transacción en `public.users`

      // 🔹 Intentar eliminar el usuario de auth.users
      const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

      if (error) {
        console.error("⚠ Error eliminando en auth.users:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      await client.query("ROLLBACK"); // 🔹 Revertir transacción si falla
      console.error("❌ Error eliminando usuario:", error);
      return false;
    } finally {
      client.release(); // 🔹 Liberar conexión
    }
  }
}
