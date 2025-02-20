import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import { LoginData } from "../types";
import { APPUser } from "../models/auth/User.entity";

export class AuthController {
  //✅
  static async register(req: Request, res: Response) {
    try {
      const allowedFields = [
        "name", "lastname", "document", "phone", "mobile",
        "email", "password", "role_id","address","schema_id"
      ];
      
      // 🔹 Filtramos solo los campos permitidos
      const filteredBody = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      ) as Partial<APPUser>;

      const user = await AuthService.userBuilder(filteredBody);

      if (!user) {
        res.status(404).json({ error: "No se pudo crear el usuario" });
      }

      res.status(201).json({ message: "Usuario registrado con éxito", user });

    } catch (error:any) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  //✅
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const allowedFields = ["email", "password"];

      function isLoginData(obj: any): obj is LoginData {
        return (
          typeof obj.email === "string" && typeof obj.password === "string"
        );
      }

      const filteredBody = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      );

      if (!isLoginData(filteredBody)) {
        res.status(404).json({ error: "Credenciales inválidas" });
        return;
      }

      const result = await AuthService.login(filteredBody);

      if (!result) {
        res.status(401).json({ error: "Credenciales inválidas" });
        return;
      }

      const { token, user } = result;
      res.json({ message: "Login exitoso", token, user });
    } catch (error:any) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  //✅
  static async logout(req: Request, res: Response): Promise<void> {

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
      return;
    }
    const token = authHeader.split(' ')[1];

    // Revocar sesión actual
    const result = await AuthService.logout(token);
    
    if (!result) {
      res.status(500).json({ message: 'Error al cerrar sesión' });
      return 
    }
  
    res.json({ message: 'Sesión cerrada correctamente' });
  };
  
}

