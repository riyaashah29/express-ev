const Order = require('../models/order');
require('dotenv').config();

exports.viewOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};

exports.viewOrders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orders = await Order.findAll({
      where: { userId },
    });
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};
