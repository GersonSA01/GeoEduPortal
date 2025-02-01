const db = require("../config/db");

const User = {
  create: ({ name, email, password }, callback) => {
    const query = `INSERT INTO users (name, email, password, approved) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, email, password, 0], callback);
  },

  findByEmail: (email, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, row) => {
      if (row) {
        console.log(`🔎 Usuario encontrado:`, row);
      }
      callback(err, row);
    });
  },

  approveUser: (email, callback) => {
    const query = `UPDATE users SET approved = 1 WHERE email = ?`;

    db.run(query, [email], function (err) {
      if (err) {
        console.error("Error al aprobar usuario en la base de datos:", err);
        return callback(err);
      }

      if (this.changes === 0) {
        console.error(`No se encontró el usuario con email ${email} en la base de datos.`);
        return callback(new Error("Usuario no encontrado"));
      }

      console.log(`Usuario aprobado en la base de datos: ${email}`);
      callback(null);
    });
  },

  deleteUser: (email, callback) => {
    const query = `DELETE FROM users WHERE email = ?`;
    db.run(query, [email], function (err) {
      if (err) {
        console.error("Error al eliminar usuario:", err);
        return callback(err);
      }
      console.log(`Usuario eliminado: ${email}`);
      callback(null);
    });
  },
};

module.exports = User;
