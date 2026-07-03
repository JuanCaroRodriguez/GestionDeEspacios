/**
 * Sistema de Gestión de Espacios Universitarios — API Backend
 *
 * @authors
 *   Wendy Buelvas España  — https://github.com/WendyBuelvas
 *   Juan C. Caro           — https://github.com/JuanCaroRodriguez
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./infrastructure/routes";
import { DatabaseConnection } from "./infrastructure/database/connection";
import { iniciarSchedulerReservas } from "./infrastructure/scheduler/reservaScheduler";

console.clear();
const app = express();
app.use(express.json());

const allowedOrigins = ["http://localhost:5174/", "http://localhost:5174", "*"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

const port = process.env.PORT || 3001;

// Usar las rutas principales
app.use("/api", routes);

// Iniciar conexión a la base de datos y luego el servidor
async function startServer() {
  try {
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();

    // Iniciar worker que marca reservas pasadas como Ejecutada
    iniciarSchedulerReservas();

    app.listen(port, () => {
      console.log(` Servidor funcionando en puerto ${port}`);
      console.log(
        ` Documentación de la API: http://localhost:${port}/api/health`,
      );
    });
  } catch (error) {
    console.error(" Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();
