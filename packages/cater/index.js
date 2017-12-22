// Copyright Jon Williams 2017. See LICENSE file.
const Cater = require("./src");

module.exports = function(options) {
  const app = new Cater(options);

  // app.prepareCommandLine();

  const babelOptions = app.sides.server.babel;
  babelOptions.cache = false;
  require("babel-register")(babelOptions);
  return app;
}

module.exports.readyCommandLine = function() {
  const commands = require('./src/commands');
  Object.keys(commands).forEach((key) => Cater.prototype[key] = commands[key] );
}

module.exports.harness = function() {
  return require("./src/harness.js");
}
