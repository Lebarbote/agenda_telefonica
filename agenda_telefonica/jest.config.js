module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/mongo.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup/'], 
};
