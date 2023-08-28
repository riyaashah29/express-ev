const Product = require('../models/product');
const { Client } = require('elasticsearch');
const Cart = require('../models/cart');
require('dotenv').config();
const esClient = new Client({ host: process.env.ELASTIC_URL }); 

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

exports.productDetail = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.searchProduct = async (req, res, next) => {
  try {
    const keyword = req.query.name;
    if (!keyword) {
      return res.json([]);
    }
    console.log(keyword)
    const data = await esClient.search({
      index: 'products',
      body: {
        query: {
          wildcard: {
            name: {
              value: `*${keyword}*`,
            },
          },
        },
      },
    });
    console.log(data)

    const products = data?.hits?.hits?.map((hit) => hit._source) || [];
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const quantity = req.body.quantity || 1;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const [cart, created] = await Cart.findOrCreate({
      where: { userId: userId },
      include: [{ model: Product }],
    });

    const existingCartItem = cart?.Products?.find((item) => item.id == productId);

    if (existingCartItem) {
      existingCartItem.CartItem.quantity += quantity;
      await existingCartItem.CartItem.save();
    } else {
      await cart.addProduct(product, { through: { quantity: quantity } });
    }

    res.status(200).json({ message: 'Item added to cart successfully.' });
  } catch (error) {
    next(error);
  }
};
