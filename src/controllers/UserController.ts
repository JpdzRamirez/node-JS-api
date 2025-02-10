import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/AuthMiddleware';
import supabase from '../config/SupabaseClient';

export class UserController {
  /**
   * Obtener el perfil del usuario autenticado
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', req.user.id)
        .single();

      if (error) throw new Error(error.message);

      res.json({ user: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Obtener todos los usuarios (solo para administradores)
   */
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'No tienes permisos' });
        return;
      }

      const { data, error } = await supabase.from('users').select('id, email, role');

      if (error) throw new Error(error.message);

      res.json({ users: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Crear un nuevo usuario (solo administradores)
   */
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'No tienes permisos para crear usuarios' });
        return;
      }

      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        res.status(400).json({ message: 'Todos los campos son obligatorios' });
        return;
      }

      const { data, error } = await supabase.from('users').insert([{ email, password, role }]);

      if (error) throw new Error(error.message);

      res.status(201).json({ message: 'Usuario creado', user: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Actualizar un usuario (admin y el propio usuario)
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email, role } = req.body;

      if (!req.user || (req.user.role !== 'admin' && req.user.id !== id)) {
        res.status(403).json({ message: 'No tienes permisos para actualizar este usuario' });
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .update({ email, role })
        .eq('id', id);

      if (error) throw new Error(error.message);

      res.json({ message: 'Usuario actualizado', user: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Eliminar un usuario (solo administradores)
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'No tienes permisos para eliminar usuarios' });
        return;
      }

      const { data, error } = await supabase.from('users').delete().eq('id', id);

      if (error) throw new Error(error.message);

      res.json({ message: 'Usuario eliminado', user: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
