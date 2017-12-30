// Copyright Jon Williams 2017. See LICENSE file.
const BabelOptions = require('./src/options-babel.js');
const fs = require('fs');
const path = require('path');
const RuntimeCater = require('./src');

module.exports = function(options = null) {
  options = options || loadConfig();

  if(options.babelRegister) {
    const babelOptions = BabelOptions();
    babelOptions.ignore = /\/node_modules\/(?!(cater$|cater-))/;
    require("babel-register")(babelOptions);
  }
  return new RuntimeCater(options);
}

module.exports.BabelOptions = BabelOptions;

const loadConfig = module.exports.loadConfig = function(file = null) {
  file = file || path.join(process.cwd(), 'cater.config.js');
  if(!fs.existsSync(file)) return {};
  const options = require(file);

  if(!!options.env) {
    const env = options.env[process.env.NODE_ENV];
    if(!!env) Object.assign(options, env);
  }

  return options;
}

module.exports.HandlerCater = function() {
  return require("./src/handler-cater");
}

module.exports.readyCommandLine = function() {
  const commands = require("./src/commands");
  Object.keys(commands).forEach(key => (RuntimeCater.prototype[key] = commands[key]));
};
