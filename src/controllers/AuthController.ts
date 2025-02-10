import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.register(req.body.email, req.body.password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { token, user } = await AuthService.login(req.body.email, req.body.password);
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};
