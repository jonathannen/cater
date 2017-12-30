// Copyright Jon Williams 2017. See LICENSE file.
const BuildCater = require("./src");
const RuntimeCater = require("cater-runtime");

/**
 * Primary entry point for the build-versions of Cater. Returns an
 * instance of the Cater Application in build-mode.
 *
 * Example Usage (assumes cater-build installed):
 *
 *     const cater = require('cater');
 *     const app = cater(...options);
 *
 * See the cater/examples directory for more detail.
 */
const index = function(options) {
  options = options || RuntimeCater.loadConfig();

  const app = new BuildCater(options);
  const babelOptions = app.sides.server.babel;
  babelOptions.cache = false;
  babelOptions.only = app.sides.server.paths;
  require("babel-register")(babelOptions);
  return app;
};

// Enables command-line functions for the Cater App objects - as specified
// in ./src/commands.js
const readyCommandLine = function() {
  const commands = require('./src/commands');
  return Object.assign(BuildCater.prototype, commands);
};

// Returns the test harness.
const testHarness = function() {
  return require('./src/harness.js');
};

const exporting = { readyCommandLine, testHarness };
module.exports = Object.assign(index, exporting);
