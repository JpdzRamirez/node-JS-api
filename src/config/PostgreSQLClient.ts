import { Pool } from 'pg';

// 🔹 Configurar la conexión con variables de entorno
const postgreSQLPOOL = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de conexión a PostgreSQL
  max: 10, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000, // Tiempo de espera máximo para conectar
});

export default postgreSQLPOOL;
