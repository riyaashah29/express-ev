const { Client } = require('elasticsearch');
require('dotenv').config();

const esClient = new Client({ host: process.env.ELASTIC_URL });
const checkElasticsearchConnection = async () => {
  try {
    await esClient.ping();
    console.log('Elasticsearch is up and running.');
    return true;
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
    return false;
  }
};

const createIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text' },
              description: { type: 'text' },
              price: { type: 'double' },
              adminId: { type: 'integer' }
            },
          },
        },
      });
      console.log('Index "products" created successfully.');
    } else {
      console.log('Index "products" already exists.');
    }
  } catch (error) {
    console.error('Error creating index:', error);
  }
};

const setupElasticsearch = async () => {
  const isConnected = await checkElasticsearchConnection();
  if (isConnected) {
    createIndex();
  } else {
    console.log('Could not set up Elasticsearch. Please ensure Elasticsearch is running.');
  }
};

setupElasticsearch();
