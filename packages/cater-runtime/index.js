// Copyright Jon Williams 2017. See LICENSE file.
const BabelOptions = require('./src/options-babel.js');
const RuntimeCater = require('./src');

module.exports = function(options) {
  const babelOptions = BabelOptions();
  babelOptions.ignore = /\/node_modules\/(?!(cater))/;
  require("babel-register")(babelOptions);
  return new RuntimeCater(options);
}

module.exports.BabelOptions = BabelOptions;

module.exports.HandlerCater = function() {
  return require("./src/handler-cater");
}

module.exports.readyCommandLine = function() {
  const commands = require("./src/commands");
  Object.keys(commands).forEach(key => (RuntimeCater.prototype[key] = commands[key]));
};
