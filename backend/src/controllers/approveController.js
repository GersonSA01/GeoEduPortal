const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gersonsuareza5@gmail.com",
    pass: "cbib qbka ybdt xxqs"
  }
});

exports.approveUser = async (req, res) => {
  const { email, approve } = req.query;

  if (!email) {
    return res.status(400).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
        <h2 style="color: red;">❌ Error: Falta el email en la solicitud</h2>
        <p>Por favor, revisa el enlace de aprobación.</p>
      </div>
    `);
  }

  try {
    if (approve === "true") {
      const updatedUser = await User.update({ approved: true }, { where: { email } });

      if (updatedUser[0] === 0) {
        return res.status(404).send(`
          <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
            <h2 style="color: red;">❌ Usuario no encontrado</h2>
            <p>No existe un usuario con este email.</p>
          </div>
        `);
      }

      console.log(`✅ Usuario aprobado con éxito: ${email}`);

      const approvalEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">🎉 ¡Felicidades! Tu cuenta ha sido aprobada</h2>
          
          <p style="font-size: 16px; color: #555;">
            Ahora puedes acceder a la plataforma y empezar a usar todas las funciones disponibles.
          </p>

          <p style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:3000/login" style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">🔑 Iniciar Sesión</a>
          </p>

          <p style="text-align: center; font-size: 14px; color: #777; margin-top: 20px;">
            Si tienes algún problema, contacta con el administrador.  
          </p>
        </div>
      `;

      transporter.sendMail({
        from: "gersonsuareza5@gmail.com",
        to: email,
        subject: "✅ Tu cuenta ha sido aprobada",
        html: approvalEmailHTML
      });

      return res.send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
          <h2 style="color: #28a745;">✅ Usuario aprobado con éxito</h2>
          <p>El usuario con email <strong>${email}</strong> ha sido aprobado.</p>
          <p>Puedes cerrar esta ventana.</p>
        </div>
      `);
    } else {
      const deletedUser = await User.destroy({ where: { email } });

      if (deletedUser === 0) {
        return res.status(404).send(`
          <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
            <h2 style="color: red;">❌ Usuario no encontrado</h2>
            <p>No existe un usuario con este email.</p>
          </div>
        `);
      }

      console.log(`❌ Usuario rechazado: ${email}`);

      const rejectionEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">❌ Tu solicitud ha sido rechazada</h2>
          
          <p style="font-size: 16px; color: #555;">
            Lamentamos informarte que tu solicitud de acceso ha sido rechazada.
          </p>

          <p style="text-align: center; font-size: 14px; color: #777; margin-top: 20px;">
            Si crees que esto es un error o necesitas más información, por favor contacta con el administrador.
          </p>
        </div>
      `;

      transporter.sendMail({
        from: "gersonsuareza5@gmail.com",
        to: email,
        subject: "❌ Tu registro ha sido rechazado",
        html: rejectionEmailHTML
      });

      return res.send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
          <h2 style="color: #dc3545;">❌ Usuario rechazado</h2>
          <p>El usuario con email <strong>${email}</strong> ha sido rechazado.</p>
          <p>Puedes cerrar esta ventana.</p>
        </div>
      `);
    }
  } catch (error) {
    console.error("Error en la aprobación/rechazo del usuario:", error);
    return res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
        <h2 style="color: red;">Error en la base de datos</h2>
        <p>Hubo un problema al procesar la solicitud.</p>
      </div>
    `);
  }
};
