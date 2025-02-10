import supabase from "../config/SupabaseClient";
import { APPUser } from "../models/UserModel";

export class UserRepository {
  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(id: string): Promise<APPUser | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error al obtener el usuario:", error);
      return null;
    }

    return data as APPUser;
  }
  async findByEmail(email: string): Promise<APPUser | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error al obtener el usuario:", error);
      return null;
    }

    return data as APPUser;
  }

  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<APPUser[]> {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      console.error("Error al obtener usuarios:", error);
      return [];
    }

    return data as APPUser[];
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(user: Omit<APPUser, "id">): Promise<APPUser | null> {
    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select()
      .single();

    if (error) {
      console.error("Error al crear el usuario:", error);
      return null;
    }

    return data as APPUser;
  }

  /**
   * Actualiza un usuario por su ID
   */
  async updateUser(
    id: string,
    user: Partial<APPUser>
  ): Promise<APPUser | null> {
    const { data, error } = await supabase
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
  }

  /**
   * Elimina un usuario por su ID
   */
  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar el usuario:", error);
      return false;
    }

    return true;
  }
}
