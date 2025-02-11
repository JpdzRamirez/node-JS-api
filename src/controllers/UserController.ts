import { Request, Response } from "express";
import { APPUser } from "../models/UserModel";
import { AuthRequest } from "../middleware/AuthMiddleware";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repository/UserRepository";

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
 
  async getProfile(req: AuthRequest, res: Response):Promise<void> {
    try {
      const { id } = req.params;

      const user = await this.userRepository.getUserById(id);

      if (!user) {        
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.status(200).json(user);

    } catch (error:any) {      
      res.status(500).json({ message: "Error interno del servidor" });      
    }
  }
  /**
   * Obtener el perfil del usuario autenticado por el email
   */
  async getUserByEmail(email: string):Promise<APPUser | null> {
    try {
      
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new Error("El email no se encuentra registrado");
      }
      return user;
      
    } catch (error:any) {      
      return null;
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
  async createUser(userData: Partial<APPUser>): Promise<APPUser | null> {
    try {
      // Verificar si el email ya está registrado
      const existingUser = await this.userRepository.findByEmail(userData.email as string);
      if (existingUser) {
        throw new Error("El email ya está registrado");
      }
      // Default mandatory data      
      userData.role_id = 2;
      // Hashear la contraseña antes de guardar
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      } else if (userData.name) {
        userData.password = await bcrypt.hash(userData.name, 10);
      }        
      // Crear el usuario en la base de datos
      return await this.userRepository.createUser(userData);
    } catch (error:any) {
      throw error;
    }
  }

  /**
   * Actualizar un usuario (admin y el propio usuario)
  */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Definir los campos permitidos para evitar actualizaciones no deseadas
      const allowedFields = ["email", "role", "password"];
      const filteredBody = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      );

      // Actualizar el usuario con los valores filtrados
      const userUpdated = await this.userRepository.updateUser(
        id,
        filteredBody
      );

      if (!userUpdated) {
        res.status(500).json({ message: "Error al actualizar el usuario" });
        return;
      }

      // Respuesta exitosa
      res
        .status(201)
        .json({ message: "Usuario actualizado", user: userUpdated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Eliminar un usuario (solo administradores)
  */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Actualizar el usuario con los valores filtrados
      const userDeleted = await this.userRepository.deleteUser(id);

      if (!userDeleted) {
        res.status(500).json({ message: "Error al crear el usuario" });
        return;
      }

      res
        .status(201)
        .json({ message: "Usuario eliminado", check: userDeleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
