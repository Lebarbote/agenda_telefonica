const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:rootpassword@mongo:27017/agenda?authSource=admin';

async function connect() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000
  });
  console.log('[mongo] connected');
}

module.exports = { connect };
