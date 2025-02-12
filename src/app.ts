import 'dotenv/config';
import express from 'express';
import { globalServerMiddleware } from './middleware/globalServerMiddleware';
import { router } from './routers';

const app = express();
app.use(express.json());

// Registrar rutas antes del middleware de errores
app.use('/api', router);

// Middleware global de manejo de errores (debe estar después de las rutas)
app.use(globalServerMiddleware);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
