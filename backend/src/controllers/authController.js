const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  User.findByEmail(email, (err, user) => {
    if (user) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Error al encriptar la contraseña" });
      }

      User.create({ name, email, password: hashedPassword }, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error al registrar usuario" });
        }

        res.status(201).json({ message: "Usuario registrado exitosamente" });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, user) => {
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({ message: "Inicio de sesión exitoso", token });
    });
  });
};
