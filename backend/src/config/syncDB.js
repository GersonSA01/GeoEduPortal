const sequelize = require("./db");
const User = require("../models/User");
const Point = require("../models/Points");

sequelize.sync({ force: false })  
  .then(() => console.log("Tablas sincronizadas con PostgreSQL en Render"))
  .catch(err => console.error("Error al sincronizar tablas:", err));
