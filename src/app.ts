import 'dotenv/config';
import express from 'express';
import { globalServerMiddleware } from './middleware/globalServerMiddleware';
import { router } from './routers';
import "reflect-metadata";
import { postgreSQLPOOL } from "./config/PostgreSQLClient"; // ✅ Import client PostgreSQLPOOL BD

const app = express();
app.use(express.json());

async function connectDatabase(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      if (!postgreSQLPOOL.isInitialized) {
        await postgreSQLPOOL.initialize();
        console.log("✅ Conected Supabase");
      }
      return; // 🔹 Conection Succsess
    } catch (error) {
      console.error(`❌ Error connect to DB (Try ${i + 1}/${retries}):`, error);
      if (i < retries - 1) {
        console.log(`🔄 Try in ${delay / 1000} seg...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error("❌ Error connection.");
        process.exit(1); // ❗ Close process to connect
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
