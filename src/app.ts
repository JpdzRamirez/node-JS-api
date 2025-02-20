import 'dotenv/config';
import express from 'express';
import { globalServerMiddleware } from './middleware/globalServerMiddleware';
import { router } from './routers';
import "reflect-metadata";
import { postgreSQLPOOL } from "./config/PostgreSQLClient"; // ✅ Importa la conexión a la BD

const app = express();
app.use(express.json());

async function connectDatabase(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      if (!postgreSQLPOOL.isInitialized) {
        await postgreSQLPOOL.initialize();
        console.log("✅ Conectado a la base de datos de Supabase");
      }
      return; // 🔹 Salir de la función si la conexión fue exitosa
    } catch (error) {
      console.error(`❌ Error al conectar la base de datos (Intento ${i + 1}/${retries}):`, error);
      if (i < retries - 1) {
        console.log(`🔄 Reintentando en ${delay / 1000} segundos...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error("❌ No se pudo conectar a la base de datos después de varios intentos.");
        process.exit(1); // ❗ Terminar el proceso si no se puede conectar
      }
    }
  }
}

async function startServer() {
  try {
    await connectDatabase(); // 🔥 Intentar conectar antes de iniciar el servidor

    // 🔹 Registrar rutas antes del middleware de errores
    app.use('/api', router);

    // 🔹 Middleware global de manejo de errores (debe estar después de las rutas)
    app.use(globalServerMiddleware);

    // 🔹 Iniciar servidor
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error crítico al iniciar el servidor:", error);
    process.exit(1);
  }
}

// 🔥 Ejecutar la función para iniciar el servidor
startServer();
