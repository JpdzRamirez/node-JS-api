import { Router } from 'express';
import authRoutes from './AuthRouters';
import userRoutes from './UserRouters';


export const router = Router();

// Ruta pública
router.get('/public', (req, res) => {
  console.log('📌 Debugging aquí... xd');
  res.json({ message: 'Esta es una ruta pública' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);


