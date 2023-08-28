const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.checkoutCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({
      where: { userId: userId },
      include: [{ model: Product }],
    });
    if (!cart || cart.Products.length === 0) {
      return res.status(404).json({ message: 'Cart is empty.' });
    }

    const totalAmount = cart.Products.reduce((total, product) => total + product.price * product.CartItem.quantity, 0);
    const order = await Order.create({
      userId: userId,
      totalAmount: totalAmount,
      status: 'pending',
    });
    const orderItems = cart.Products.map((product) => ({
      OrderId: order.id,
      ProductId: product.id,
      quantity: product.CartItem.quantity,
      subtotal: product.price * product.CartItem.quantity,
    }));
    await OrderItem.bulkCreate(orderItems);
    await cart.setProducts(null);
    res.status(200).json({ message: 'Cart checked out successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.placeOrder = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findByPk(orderId);
    if (!order || order.status !== 'pending') {
      return res.status(404).json({ message: 'Invalid order.' });
    }
    const roundedTotalAmount = parseInt(order.totalAmount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: roundedTotalAmount, // Stripe expects the amount in cents, so convert it back to cents
      currency: 'INR',
      description: 'Order Payment',
      payment_method_types: ['card'],
    });
    await order.update({ status: 'paid' });
    res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
