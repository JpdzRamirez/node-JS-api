import { Response, NextFunction } from 'express';
import { AuthRequest } from "../types";

export const roleMiddleware = (roles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Acceso no autorizado' });
      return;
    }

    const roleId = req.user.role_id ?? NaN; // Si es undefined/null, asignamos NaN

    if (isNaN(roleId) || !roles.includes(roleId)) {
      res.status(403).json({ message: 'Sin permisos de usuario' });
      return;
    }

    next();
  };
};
