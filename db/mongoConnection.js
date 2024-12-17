const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.DATABASE_URI;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectMongoDB;