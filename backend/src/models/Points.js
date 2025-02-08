const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Point = sequelize.define("Point", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING },
  images: { type: DataTypes.STRING }
}, { timestamps: false });

module.exports = Point;
