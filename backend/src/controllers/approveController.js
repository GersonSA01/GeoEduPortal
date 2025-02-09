const User = require("../models/User");
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

exports.approveUser = async (req, res) => {
  const { email, approve } = req.query;

  if (!email) {
    return res.status(400).send(`
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: red;">❌ Error: Falta el email en la solicitud</h2>
        <p>Por favor, revisa el enlace de aprobación.</p>
      </div>
    `);
  }

  try {
    if (approve === "true") {
      const [updatedRows] = await User.update({ approved: true }, { where: { email } });

      if (updatedRows === 0) {
        return res.status(404).send(`
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2 style="color: red;">❌ Usuario no encontrado</h2>
            <p>No existe un usuario con este email.</p>
          </div>
        `);
      }

      console.log(`✅ Usuario aprobado con éxito: ${email}`);

      const approvalEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #333; text-align: center;">🎉 ¡Felicidades! Tu cuenta ha sido aprobada</h2>
          <p style="font-size: 16px; color: #555;">
            Ahora puedes acceder a la plataforma y empezar a usar todas las funciones disponibles.
          </p>
          <p style="text-align: center;">
            <a href="http://localhost:3000/login" style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">🔑 Iniciar Sesión</a>
          </p>
          <p style="text-align: center; font-size: 14px; color: #777;">
            Si tienes algún problema, contacta con el administrador.  
          </p>
        </div>
      `;

      await sendEmail(email, "✅ Tu cuenta ha sido aprobada", approvalEmailHTML);

      return res.send(`
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2 style="color: #28a745;">✅ Usuario aprobado con éxito</h2>
          <p>El usuario con email <strong>${email}</strong> ha sido aprobado.</p>
          <p>Puedes cerrar esta ventana.</p>
        </div>
      `);
    } else {
      const deletedRows = await User.destroy({ where: { email } });

      if (deletedRows === 0) {
        return res.status(404).send(`
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2 style="color: red;">❌ Usuario no encontrado</h2>
            <p>No existe un usuario con este email.</p>
          </div>
        `);
      }

      console.log(`Usuario rechazado: ${email}`);

      const rejectionEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #333; text-align: center;">❌ Tu solicitud ha sido rechazada</h2>
          <p style="font-size: 16px; color: #555;">
            Lamentamos informarte que tu solicitud de acceso ha sido rechazada.
          </p>
          <p style="text-align: center; font-size: 14px; color: #777;">
            Si crees que esto es un error o necesitas más información, por favor contacta con el administrador.
          </p>
        </div>
      `;

      await sendEmail(email, "❌ Tu registro ha sido rechazado", rejectionEmailHTML);

      return res.send(`
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2 style="color: #dc3545;">❌ Usuario rechazado</h2>
          <p>El usuario con email <strong>${email}</strong> ha sido rechazado.</p>
          <p>Puedes cerrar esta ventana.</p>
        </div>
      `);
    }
  } catch (error) {
    console.error("❌ ERROR en la aprobación/rechazo del usuario:", error);
    return res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: red;">Error en la base de datos</h2>
        <p>Hubo un problema al procesar la solicitud.</p>
      </div>
    `);
  }
};
