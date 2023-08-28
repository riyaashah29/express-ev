const express = require('express');
const productController = require('../controllers/product');
const isAuthMiddleware = require('../middleware/is-auth');
const ROLES = require("../util/roles");
const route = express.Router();

route.get('/', isAuthMiddleware.isauth,productController.getAllProducts);

route.get('/elasticsearch', isAuthMiddleware.isauth ,productController.searchProduct);

route.get('/:productId', isAuthMiddleware.isauth ,productController.productDetail);

route.post('/:productId/addToCart', isAuthMiddleware.isauth, isAuthMiddleware.checkrole([ROLES.USER]),productController.addToCart);

module.exports = route;