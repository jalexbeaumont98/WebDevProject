// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/server/__tests__/**/*.test.js"],
  transform: {}, // no Babel transforms, we’re just testing Node/Express
};