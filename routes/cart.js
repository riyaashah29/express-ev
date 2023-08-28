const express = require('express');
const route = express.Router();

const ROLES = require('../util/roles');

const isAuthMiddleware = require('../middleware/is-auth');
const cartController = require('../controllers/cart');

route.post('/checkout', isAuthMiddleware.isauth, isAuthMiddleware.checkrole([ROLES.USER]), cartController.checkoutCart);

route.post('/checkout/payment/:orderId', isAuthMiddleware.isauth, isAuthMiddleware.checkrole([ROLES.USER]) ,cartController.placeOrder);

module.exports = route;