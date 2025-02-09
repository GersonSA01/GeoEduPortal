const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  if (!to) {
    console.error("ERROR: No se ha definido el destinatario del correo.");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("ERROR enviando email:", error);
  }
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: "Datos inválidos o contraseña demasiado corta" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    if (!process.env.EMAIL_USER) {
        console.error("ERROR: ADMIN_EMAIL no está definido en .env");
        return res.status(500).json({ message: "Error en la configuración del servidor." });
    }

    const approvalLink = `${process.env.APPROVE_URL}?email=${email}&approve=true`;
    const rejectionLink = `${process.env.APPROVE_URL}?email=${email}&approve=false`;

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Solicitud de Aprobación de Administrador</h2>
        <p>Un usuario ha solicitado acceso como administrador. Revisa los detalles y aprueba o rechaza la solicitud.</p>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>
          <a href="${approvalLink}" style="padding: 10px; background-color: green; color: white;">✅ Aprobar</a>
          <a href="${rejectionLink}" style="padding: 10px; background-color: red; color: white;">❌ Rechazar</a>
        </p>
      </div>
    `;

    await sendEmail(process.env.EMAIL_USER, "Nueva solicitud de administrador", emailHTML);

    res.status(201).json({ message: "Registro exitoso. Espera la aprobación del administrador." });

  } catch (error) {
    console.error("ERROR al registrar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña requeridos" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.approved) {
      return res.status(403).json({ message: "Tu cuenta está en revisión.", approved: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Inicio de sesión exitoso", token, approved: true });

  } catch (error) {
    console.error("ERROR en login:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};
