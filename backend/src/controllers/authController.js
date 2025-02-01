const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gersonsuareza5@gmail.com", 
    pass: "cbib qbka ybdt xxqs"
  }
});

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

        const approvalLink = `http://localhost:5000/api/auth/approve?email=${email}&approve=true`;
        const rejectionLink = `http://localhost:5000/api/auth/approve?email=${email}&approve=false`;

        const emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333; text-align: center;">Solicitud de Aprobación de Administrador</h2>
            
            <p style="font-size: 16px; color: #555;">
              Un usuario ha solicitado acceso como administrador. Por favor, revisa los detalles y aprueba o rechaza la solicitud.
            </p>

            <div style="background-color: #f8f8f8; padding: 10px; border-radius: 6px; margin-top: 10px;">
              <p><strong>👤 Nombre del usuario:</strong> ${name}</p>
              <p><strong>📧 Email del usuario:</strong> ${email}</p>
            </div>

            <p style="text-align: center; margin-top: 20px;">
              <a href="${approvalLink}" style="display: inline-block; padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">✅ Aprobar</a>
              <a href="${rejectionLink}" style="display: inline-block; padding: 12px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">❌ Rechazar</a>
            </p>

            <p style="text-align: center; font-size: 14px; color: #777; margin-top: 20px;">
              🔒 Este mensaje es automático. Si no solicitaste esta acción, ignora este correo.
            </p>
          </div>
        `;

        transporter.sendMail({
          from: "gersonsuareza5@gmail.com",
          to: "gersonsuareza5@gmail.com", 
          subject: "Nueva solicitud de administrador",
          html: emailHTML
        }, (error, info) => {
          if (error) {
            console.error("Error al enviar correo al súper administrador:", error);
          } else {
            console.log("Correo de solicitud enviado al súper administrador:", info.response);
          }
        });

        res.status(201).json({ message: "Registro exitoso. Espera la aprobación del administrador." });
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

    if (!user.approved) {
      return res.status(403).json({ message: "Tu cuenta está en revisión.", approved: false });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ message: "Inicio de sesión exitoso", token, approved: true });
    });
  });
};
