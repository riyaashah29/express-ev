const { Client } = require('elasticsearch');
const Product = require('./models/product');
require('dotenv').config();

const esClient = new Client({ host: process.env.ELASTIC_URL, requestTimeout: 1200000 });

const generateDummyProducts = (count) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    let id = parseInt(i);
    const product = {
      id: id,
      name: `Product${i}`,
      description: `This is product ${i}.`,
      price: Math.random() * 100,
      adminId: 1,
    };
    products.push(product);
  }
  return products;
};

const bulkInsertProducts = async (products) => {
  const batchSize = 10; 
  const totalProducts = products.length;
  let currentBatch = [];

  for (let i = 0; i < totalProducts; i++) {
    currentBatch.push({ index: { _index: 'products' } });
    currentBatch.push(products[i]);

    if (currentBatch.length >= batchSize || i === totalProducts - 1) {
      const body = currentBatch.flatMap((doc) => [{ index: { _index: 'products' } }, doc]);
      try {
        const { body: bulkResponse } = await esClient.bulk({ refresh: true, body });
        console.log(`Successfully inserted ${currentBatch.length / 2} products into Elasticsearch.`);
        const dataForBulkInsert = currentBatch
        .filter((doc) => doc.index === undefined) 
        .map((doc) => doc); 

      await Product.bulkCreate(dataForBulkInsert);
        console.log(`Successfully inserted ${dataForBulkInsert.length / 2} products into PostgreSQL.`);
      } catch (error) {
        console.error('Error inserting products:', error);
      }
      currentBatch = [];
    }
  }
};

const dummyProductsCount = 50;
const dummyProducts = generateDummyProducts(dummyProductsCount);

bulkInsertProducts(dummyProducts);


