const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  approved: { type: DataTypes.BOOLEAN, defaultValue: false } 
}, { timestamps: false });

User.findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

User.approveUser = async (email) => {
  return await User.update({ approved: true }, { where: { email } });
};

User.deleteUser = async (email) => {
  return await User.destroy({ where: { email } });
};

module.exports = User;
