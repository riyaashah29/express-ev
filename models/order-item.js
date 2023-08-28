const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const OrderItem = sequelize.define('OrderItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  module.exports = OrderItem;