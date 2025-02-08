const Point = require("../models/Points");
const fs = require("fs");
const path = require("path");

exports.getAllPoints = async (req, res) => {
  try {
    const points = await Point.findAll();
    res.status(200).json(points);
  } catch (error) {
    console.error("Error al obtener los puntos:", error);
    res.status(500).json({ error: "Error al obtener los puntos" });
  }
};

exports.createPoint = async (req, res) => {
  const { name, description, latitude, longitude, type, url } = req.body;

  if (!name || !latitude || !longitude || !type) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const images = req.files?.map((file) => `/uploads/${file.filename}`).join(",") || null;

    const newPoint = await Point.create({
      name,
      description,
      latitude,
      longitude,
      type,
      url,
      images
    });

    res.status(201).json({ id: newPoint.id, message: "Punto agregado exitosamente" });

  } catch (error) {
    console.error("Error al agregar el punto:", error);
    res.status(500).json({ error: "Error al agregar el punto" });
  }
};

exports.updatePoint = async (req, res) => {
  const { id } = req.params;
  const { name, description, latitude, longitude, type, url } = req.body;

  if (!name || !latitude || !longitude || !type) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const existingPoint = await Point.findByPk(id);
    if (!existingPoint) {
      return res.status(404).json({ error: "Punto no encontrado" });
    }

    const newImages = req.files?.length 
      ? req.files.map((file) => `/uploads/${file.filename}`).join(",") 
      : existingPoint.images;

    const [updatedRows] = await Point.update(
      { name, description, latitude, longitude, type, url, images: newImages },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: "No se pudo actualizar el punto" });
    }

    res.status(200).json({ message: "Punto editado exitosamente", updatedPoint: newImages });

  } catch (error) {
    console.error("Error al editar el punto:", error);
    res.status(500).json({ error: "Error al editar el punto" });
  }
};

exports.deletePoint = async (req, res) => {
  const { id } = req.params;

  try {
    const point = await Point.findByPk(id);
    if (!point) {
      return res.status(404).json({ error: "Punto no encontrado" });
    }

    if (point.images) {
      const imagePaths = point.images.split(",");
      imagePaths.forEach((img) => {
        const filePath = path.join(__dirname, "../../", img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await point.destroy();
    res.status(200).json({ message: "Punto eliminado exitosamente" });

  } catch (error) {
    console.error("Error al eliminar el punto:", error);
    res.status(500).json({ error: "Error al eliminar el punto" });
  }
};
