import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./infrastructure/routes";
import { DatabaseConnection } from "./infrastructure/database/connection";

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
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

const port = process.env.PORT || 3001;

// Usar las rutas principales
app.use("/api", routes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "API de Gestión de Espacios funcionando",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth (login/perfil)",
      usuarios: "/api/usuarios (solo lectura)",
      espacios: "/api/espacios (solo lectura)",
      reservas: "/api/reservas (solo lectura)",
      superadmin: "/api/superadmin (gestión usuarios/espacios)",
      administrador: "/api/administrador (evaluar reservas)",
      health: "/api/health",
    },
  });
});

// Iniciar conexión a la base de datos y luego el servidor
async function startServer() {
  try {
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();

    app.listen(port, () => {
      console.log(`🚀 Servidor funcionando en puerto ${port}`);
      console.log(
        `📚 Documentación de la API: http://localhost:${port}/api/health`,
      );
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();
