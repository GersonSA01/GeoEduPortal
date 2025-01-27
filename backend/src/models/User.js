const db = require("../config/db");

const User = {
  create: ({ name, email, password }, callback) => {
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(query, [name, email, password], callback);
  },

  findByEmail: (email, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], callback);
  },

  findById: (id, callback) => {
    const query = `SELECT * FROM users WHERE id = ?`;
    db.get(query, [id], callback);
  },
};

module.exports = User;
