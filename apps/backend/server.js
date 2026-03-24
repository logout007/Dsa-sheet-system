// server.js — used for local development only (npm run dev)
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
  });
};

start();
