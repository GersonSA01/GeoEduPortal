const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const router = express.Router();

// Configuración de multer
const uploadsDir = path.join(__dirname, "../../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Obtener todos los puntos
router.get("/", (req, res) => {
  db.all("SELECT * FROM points", [], (err, rows) => {
    if (err) {
      console.error("Error al obtener los puntos:", err.message);
      return res.status(500).json({ error: "Error al obtener los puntos" });
    }
    res.status(200).json(rows);
  });
});

// Agregar un nuevo punto
router.post("/", upload.array("images"), (req, res) => {
  const { name, description, latitude, longitude, type, url } = req.body;
  if (!name || !latitude || !longitude || !type) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  const images = req.files.map((file) => `/uploads/${file.filename}`).join(",");
  db.run(
    "INSERT INTO points (name, description, latitude, longitude, type, url, images) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, description, latitude, longitude, type, url, images],
    function (err) {
      if (err) {
        console.error("Error al agregar el punto:", err.message);
        return res.status(500).json({ error: "Error al agregar el punto" });
      }
      res.status(201).json({ id: this.lastID, message: "Punto agregado exitosamente" });
    }
  );
});

// Editar un punto
router.put("/:id", upload.array("images"), (req, res) => {
  const { id } = req.params;
  const { name, description, latitude, longitude, type, url } = req.body;

  if (!name || !latitude || !longitude || !type) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const images = req.files.length
    ? req.files.map((file) => `/uploads/${file.filename}`).join(",")
    : null;

  const query = images
    ? "UPDATE points SET name = ?, description = ?, latitude = ?, longitude = ?, type = ?, url = ?, images = ? WHERE id = ?"
    : "UPDATE points SET name = ?, description = ?, latitude = ?, longitude = ?, type = ?, url = ? WHERE id = ?";

  const params = images
    ? [name, description, latitude, longitude, type, url, images, id]
    : [name, description, latitude, longitude, type, url, id];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Error al editar el punto:", err.message);
      return res.status(500).json({ error: "Error al editar el punto" });
    }
    res.status(200).json({ message: "Punto editado exitosamente" });
  });
});

// Eliminar un punto
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT images FROM points WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error al buscar el punto:", err.message);
      return res.status(500).json({ error: "Error al buscar el punto" });
    }

    if (row && row.images) {
      const imagePaths = row.images.split(",");
      imagePaths.forEach((img) => {
        const filePath = path.join(__dirname, "../../", img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    db.run("DELETE FROM points WHERE id = ?", [id], function (err) {
      if (err) {
        console.error("Error al eliminar el punto:", err.message);
        return res.status(500).json({ error: "Error al eliminar el punto" });
      }
      res.status(200).json({ message: "Punto eliminado exitosamente" });
    });
  });
});

module.exports = router;
