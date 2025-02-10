import { Request, Response } from 'express';
import { validationResult } from "express-validator";
import { AuthRequest } from '../middleware/AuthMiddleware';
import supabase from '../config/SupabaseClient';
import { UserRepository } from '../repository/UserRepository';

export class UserController {

  /*
    Global repositorys query
  */
  private userRepository = new UserRepository();

  constructor() {
    this.userRepository = new UserRepository();
  }
  /**
   * Obtener el perfil del usuario autenticado por el id
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await this.userRepository.getUserById(id);

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json(user);

    } catch (error) {
      console.error('Error en getProfile:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
    /**
   * Obtener el perfil del usuario autenticado por el email
   */
    async getUserByEmail(req: AuthRequest, res: Response): Promise<void> {
      try {
        const { email } = req.params;
        const user = await this.userRepository.findByEmail(email);
  
        if (!user) {
          res.status(404).json({ message: 'Usuario no encontrado' });
          return;
        }
  
        res.json(user);
  
      } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
      }
    }

  

  /**
   * Obtener todos los usuarios (solo para administradores)
   */
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Obtener todos los usuarios
      const users = await this.userRepository.getAllUsers();
      // Respuesta exitosa
      res.status(201).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Crear un nuevo usuario (solo administradores)
   */
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      // Verificar si el email ya está registrado
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        res.status(400).json({ message: 'El email ya está registrado' });
        return;
      }

      // Crear el usuario
      const newUser = await this.userRepository.createUser({ email, password, role });

      if (!newUser) {
        res.status(500).json({ message: 'Error al crear el usuario' });
        return;
      }

      // Respuesta exitosa
      res.status(201).json(newUser);

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
      const { email, role,password } = req.body;

    // Actualizar el usuario
    const userUpdated = await this.userRepository.updateUser(id, { email, role, password });

      if (!userUpdated) {
        res.status(500).json({ message: 'Error al actualizar el usuario' });
        return;
      }

     // Respuesta exitosa    
      res.status(201).json({ message: 'Usuario actualizado', user: userUpdated });
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
