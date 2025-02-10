import 'dotenv/config';
import express from 'express';
import { router } from './routers';

const app = express();
app.use(express.json());

// Registrar rutas antes del middleware de errores
app.use('/api', router);

// Middleware global de manejo de errores (debe estar después de las rutas)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
