const clone = require('clone');
const path = require("path");

const resolver = path.join(__dirname, "resolver.js");
const transformer = path.join(__dirname, "transformer.js");

const config = {
  resolver: resolver,
  transform: { "\\.js$": transformer },
  transformIgnorePatterns: ["node_modules/(?!(cater)/)"]
};

module.exports = function() {
  return clone(config);
}
