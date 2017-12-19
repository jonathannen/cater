const test = require("cater-jest");

module.exports = {
  resetModules: false,
  reporters: ["default", test.reporter],
  resolver: test.resolver,
  transform: { "\\.js$": test.transformer },
  transformIgnorePatterns: ["node_modules/(?!(cater)/)"]
};
