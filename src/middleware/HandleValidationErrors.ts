import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Responde con un error 400 y los errores de validación
        res.status(400).json({ errors: errors.array() });
        return; 
    }
    next(); 
};