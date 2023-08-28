const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");
const User = require('./models/user');
const Product = require('./models/product');
const CartItem = require('./models/cartItems');
const Order = require('./models/order');
const Cart = require('./models/cart');

const sequelize = require('./util/database');

require("dotenv").config();

app.use(bodyParser.json());
app.use("/user/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
  });

User.hasMany(Cart);
Cart.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, { through: 'OrderItem' });
Product.belongsToMany(Order, { through: 'OrderItem' });

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

(async () => {
  try {
    await sequelize.sync();
    console.log('Database tables have been created successfully.');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
  }
})();
