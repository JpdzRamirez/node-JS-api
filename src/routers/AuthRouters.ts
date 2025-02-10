import { Router, Request, Response } from 'express';
import AuthService from '../services/AuthService';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    const user = await AuthService.register(email, password);
    res.status(201).json({ message: 'Usuario registrado con éxito', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    const { token, user } = await AuthService.login(email, password);
    res.json({ message: 'Login exitoso', token, user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
