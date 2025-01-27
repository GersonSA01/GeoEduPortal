const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const pointRoutes = require("./routes/pointRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir la carpeta "uploads" como recursos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/points", pointRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;
