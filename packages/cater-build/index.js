// Copyright Jon Williams 2017. See LICENSE file.
const BuildCater = require("./src");
// const RuntimeCater = require("cater-runtime");

module.exports = function(options) {
  const app = new BuildCater(options);
  const babelOptions = app.sides.server.babel;
  babelOptions.cache = false;
  babelOptions.ignore = /\/node_modules\/(?!(cater))/;
  require("babel-register")(babelOptions);
  return app;
};

module.exports.readyCommandLine = function() {
  const commands = require("./src/commands");
  Object.keys(commands).forEach(key => (BuildCater.prototype[key] = commands[key]));
};

module.exports.harness = function() {
  return require("./src/harness.js");
};
