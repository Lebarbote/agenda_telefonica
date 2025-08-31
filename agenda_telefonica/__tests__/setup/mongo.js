const mongoose = require('mongoose');

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://root:rootpassword@mongo:27017/agenda_test?authSource=admin';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
