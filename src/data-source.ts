import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Cargar las variables de entorno desde .env
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, // Usa la conexión de Supabase
  synchronize: true, // ❗ Solo en desarrollo, en producción usar migrations
  logging: false,
  entities: ["src/models/**/*.ts"], // Ruta a tus entidades
  migrations: ["src/models/migrations/**/*.ts"],
  subscribers: [],
  extra: {
    max: 10, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar
    connectionTimeoutMillis: 2000, // Tiempo máximo de espera para conectar
  },
});
