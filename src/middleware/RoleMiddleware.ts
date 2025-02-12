import { Response, NextFunction } from 'express';
import { AuthRequest } from './AuthMiddleware';

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Acceso no autorizado' });
      return;
    }

    // Validar que el usuario tenga uno de los roles permitidos
    if (!roles.includes(req.user.role_id)) {
      res.status(403).json({ message: 'Permisos no concedidos para esta transacción' });
      return;
    }

    next();
  };
};
