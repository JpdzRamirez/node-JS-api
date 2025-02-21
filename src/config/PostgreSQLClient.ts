import "reflect-metadata";
import { DataSource } from "typeorm";
import { APPUser } from "../models/auth/User.entity"; // Asegúrate de que la ruta es correcta
import { Role } from "../models/auth/Role.entity";  // Si usas roles

import dotenv from "dotenv";

// Cargar las variables de entorno desde .env
dotenv.config();

export const postgreSQLPOOL  = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, // Supabase URL
  synchronize: true, // develop
  logging: false,
  entities: [APPUser, Role], // Ruta a tus entidades
  migrations: ["src/models/migrations/**/*.ts"],
  subscribers: [],
  extra: {
    max: 10, // Max pool
    idleTimeoutMillis: 30000, // Inactivity
    connectionTimeoutMillis: 2000, // Máximo time
  },
});
