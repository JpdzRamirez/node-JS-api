import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import { LoginData, RegisterData } from "../types";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const allowedFields = [
        "name", "lastname", "document", "phone", "mobile",
        "email", "password", "role_id","address"
      ];
      
      // 🔹 Filtramos solo los campos permitidos
      const filteredBody: Partial<RegisterData> = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      );

      const user = await AuthService.register(filteredBody as RegisterData);

      res.status(201).json({ message: "Usuario registrado con éxito", user });
    } catch (error:any) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

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
        throw new Error("Error en datos suministrados");
      }

      const result = await AuthService.login(filteredBody);

      if (!result) {
        res.status(401).json({ error: "Credenciales inválidas" });
        return;
      }

      const { token, user } = result;
      res.json({ message: "Login exitoso", token, user });
    } catch (error:any) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}
