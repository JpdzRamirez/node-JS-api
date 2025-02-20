import { supabaseAnon, supabaseAdmin } from "../config/SupabaseClient";
import { postgreSQLPOOL } from "../config/PostgreSQLClient";
import { APPUser } from "../models/auth/User.entity";
import { Repository } from "typeorm";

import bcrypt from "bcryptjs";

export class UserRepository {
  private userRepository: Repository<APPUser>;

  constructor() {
    this.userRepository = postgreSQLPOOL.getRepository(APPUser);
  }
  /** ✅
   * Obtiene un usuario por su ID
   */
  async getUserById(id: number): Promise<APPUser | null> {
    try {
      return await this.userRepository.findOne({
        where: { id },
        relations: ["roles"], // 🔹 Cargar relación con roles automáticamente
      });
    } catch (error) {
      console.error("❌ Error en getUserById:", error);
      throw error;
    }
  }

  /*✅
  Get by Email
  */
  async findByEmail(email: string): Promise<APPUser | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ["roles"], // 🔹 Cargar relación con roles
      });

      return user || null;
    } catch (error) {
      console.error("❌ Error en findByEmail:", error);
      throw error;
    }
  }

  /**✅
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<APPUser[]> {
    try {
      return await this.userRepository.find({
        relations: ["roles"], // 🔹 Cargar relación con roles automáticamente
      });
    } catch (error) {
      console.error("❌ Error en getAllUsers:", error);
      throw error;
    }
  }

  /**✅
   * Crea un nuevo usuario
   */
  async createUser(user: Partial<APPUser>): Promise<any> {

    let authUserId: string | null = null;
    const queryRunner = postgreSQLPOOL.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(); // 🔹 Iniciar transacción

    try {
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
          role_id: user.roles?.id ?? 2,
          phone: user.mobile ?? "",
          mobile: user.mobile ?? "",
          address: user.address ?? "",
        },
      });

      if (error || !data?.user || !user.password) {
        throw new Error(
          `Error en Supabase Auth: ${error?.message || "No se pudo crear el usuario"}`
        );
      }
      authUserId = data.user.id;

      // 🔹 Especificar el esquema donde se guardará el usuario
      const schemaName = "acueducto11"; // Puedes cambiarlo dinámicamente

      const passwordHashed = bcrypt.hashSync(user.password, 10);

      // 🔹 Insertar usuario en `schemaName.users`
      const newUser = queryRunner.manager.create(APPUser, {
          uuid_authsupa: authUserId,
          document: user.document ?? "",
          password: passwordHashed ?? "",
          email: user.email ?? "",
          name: user.name ?? "",
          lastname: user.lastname ?? "",
          roleId: user.roles?.id ?? 2,
          phone: user.phone ?? "",
          mobile: user.mobile ?? "",
          address: user.address ?? "",
      });

      // 🔹 Guardar el usuario en el esquema especificado
      const savedUser = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(`${schemaName}.users`) // 🔹 Esquema dinámico
          .values(newUser)
          .execute();

      await queryRunner.commitTransaction(); // 🔹 Confirmar transacción

      return savedUser;

    } catch (error) {
      await queryRunner.rollbackTransaction(); // 🔹 Revertir cambios en `public.users`
      console.error("❌ Error al crear usuario:", error);

      if (authUserId) {
        // 🔹 Si la transacción falló, eliminar usuario en `auth.users`
        console.log("🗑 Eliminando usuario en auth.users...");
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }

      throw error;
    } finally {
      await queryRunner.release(); // 🔹 Liberar conexión
    }
  }

  /**✅
   * Actualiza un usuario por su ID
   */
  async updateUser(id: number, user: Partial<APPUser>): Promise<APPUser | null> {

    const queryRunner = postgreSQLPOOL.createQueryRunner(); // Crear QueryRunner para transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // 🔹 1. Actualizar `public.users` en la base de datos
      user.updated_at = new Date(); // Agregar timestamp de actualización
      if (!user.password) {
        throw new Error(
          `Error de validación de campos || "No se pudo actualizar el usuario"}`
        );
      }

      user.password = bcrypt.hashSync(user.password, 10);

      await queryRunner.manager.update(APPUser, id, user); // Actualiza el usuario en la BD
  
      // 🔹 Obtener el usuario actualizado
      const updatedUser = await queryRunner.manager.findOne(APPUser, {
        where: { id },
        relations: ["roles"], // Cargar relación con roles
      });
  
      if (!updatedUser) {
        throw new Error("No se pudo actualizar el usuario en public.users.");
      }
      
      // 🔹 2. Actualizar `auth.users` en Supabase
      const authUpdates = {
        email: updatedUser.email,
        password: user.password,
        phone: updatedUser.phone,
        user_metadata: {
          display_name: `${updatedUser.name ?? ""} ${updatedUser.lastname ?? ""}`,
          document: updatedUser.document,
          name: updatedUser.name,
          lastname: updatedUser.lastname,
          role_id: updatedUser.roles?.id,
          phone: updatedUser.phone,
          mobile: updatedUser.mobile,
          address: updatedUser.address,
        },
      };
      
      if(!updatedUser.uuid_authsupa){
        throw new Error(`Error al realizar la actualización`);
      }
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        updatedUser.uuid_authsupa,
        authUpdates
      );
  
      if (authError) {
        throw new Error(`Error al actualizar en auth.users: ${authError.message}`);
      }
  
      // 🔹 Confirmar la transacción
      await queryRunner.commitTransaction();
      // Retornar el usuario actualizado
      return updatedUser; 
  
    } catch (error) {
      //🔹 Revertir en caso de error
      await queryRunner.rollbackTransaction(); 
      console.error("Error al actualizar usuario:", error);
      throw error;
    } finally {
      await queryRunner.release(); // Liberar QueryRunner
    }
  }
  

  /**✅
   * Elimina un usuario por su ID
   */
  async deleteUser(id: number): Promise<boolean> {
    const queryRunner = postgreSQLPOOL.createQueryRunner(); // Crear QueryRunner para transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // 🔹 1. Obtener el usuario antes de eliminarlo
      const user = await queryRunner.manager.findOne(APPUser, { where: { id } });
  
      if (!user) {
        return false; // Si no existe, no se elimina
      }
  
      // 🔹 2. Eliminar usuario en `public.users`
      await queryRunner.manager.delete(APPUser, id);

      if(!user.uuid_authsupa){
        throw new Error(`Error al realizar la actualización`);
      }
      // 🔹 3. Eliminar usuario en Supabase Auth
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.uuid_authsupa);
  
      if (error) {
        throw new Error(`Error al eliminar usuario en auth.users: ${error.message}`);
      }
  
      // 🔹 4. Confirmar la transacción
      await queryRunner.commitTransaction();
      return true;
  
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Revertir en caso de error
      console.error("❌ Error eliminando usuario:", error);
      throw error;
    } finally {
      await queryRunner.release(); // Liberar QueryRunner
    }
  }
  
}
