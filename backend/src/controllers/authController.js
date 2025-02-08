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

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si el usuario ya está registrado
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    await User.create({ name, email, password: hashedPassword });

    const approvalLink = `http://localhost:5000/api/auth/approve?email=${email}&approve=true`;
    const rejectionLink = `http://localhost:5000/api/auth/approve?email=${email}&approve=false`;

    // Enviar correo al superadministrador
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

    await transporter.sendMail({
      from: "gersonsuareza5@gmail.com",
      to: "gersonsuareza5@gmail.com",
      subject: "Nueva solicitud de administrador",
      html: emailHTML
    });

    res.status(201).json({ message: "Registro exitoso. Espera la aprobación del administrador." });

  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario en la base de datos
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario ha sido aprobado
    if (!user.approved) {
      return res.status(403).json({ message: "Tu cuenta está en revisión.", approved: false });
    }

    // Comparar la contraseña encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Inicio de sesión exitoso", token, approved: true });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};
