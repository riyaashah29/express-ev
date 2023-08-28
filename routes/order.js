const express = require('express');
const route = express.Router();

const ROLES = require('../util/roles');

const isAuthMiddleware = require('../middleware/is-auth');
const orderController = require('../controllers/order');


route.get('/', isAuthMiddleware.isauth, isAuthMiddleware.checkrole([ROLES.USER]) ,orderController.viewOrders);

route.get('/:orderId', isAuthMiddleware.isauth, isAuthMiddleware.checkrole([ROLES.USER]) ,orderController.viewOrder);

module.exports = route;