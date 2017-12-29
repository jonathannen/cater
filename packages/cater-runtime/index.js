// Copyright Jon Williams 2017. See LICENSE file.
const BabelOptions = require('./src/options-babel.js');
const RuntimeCater = require('./src');

module.exports = function() {
  const babelOptions = BabelOptions();
  babelOptions.cache = false;
  babelOptions.ignore = /(\/node_modules\/|build\/)/
  require("babel-register")(babelOptions);

  return new RuntimeCater();
}

module.exports.HandlerCater = function() {
  return require("./src/handler-cater");
}

module.exports.readyCommandLine = function() {
  const commands = require("./src/commands");
  Object.keys(commands).forEach(key => (RuntimeCater.prototype[key] = commands[key]));
};
