// Copyright Jon Williams 2017. See LICENSE file.
const BuildCater = require("./src");
const RuntimeCater = require("cater-runtime");

const index = function(options) {
  options = options || RuntimeCater.loadConfig();

  const app = new BuildCater(options);
  const babelOptions = app.sides.server.babel;
  // babelOptions.cache = false;
  babelOptions.only = app.sides.server.paths;
  require("babel-register")(babelOptions);
  return app;
};

const readyCommandLine = function() {
  const commands = require("./src/commands");
  return Object.assign(BuildCater.prototype, commands);
};

const testHarness = function() {
  return require("./src/harness.js");
};

const exporting = { readyCommandLine, testHarness };
module.exports = index;
Object.assign(module.exports, exporting);
