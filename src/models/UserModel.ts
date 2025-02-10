import supabase from '../config/SupabaseClient';

export interface APPUser {
  id: string;
  email: string;
  password?: string;
  role: string;
}

class UserModel {
  static async findByEmail(email: string): Promise<APPUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  static async createUser(email: string, password: string, role: string = 'user'): Promise<APPUser> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  
    if (!data.user?.id) {
      throw new Error("Error al crear el usuario: ID no generado por Supabase");
    }
    
    await supabase.from('users').insert([{ id: data.user.id, email, role }]);
    return { id: data.user.id, email, role };
  }
}

export default UserModel;
