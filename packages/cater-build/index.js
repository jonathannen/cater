// Copyright Jon Williams 2017-2018. See LICENSE file.
const BuildCater = require('./src');
const RuntimeCater = require('cater-runtime');

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
 *
 * @module cater-build
 */
function index(options = {}) {
  const caterOptions = Object.assign(RuntimeCater.loadConfig(), options);
  const app = new BuildCater(caterOptions);

  const babelOptions = app.sides.server.babel;
  Object.assign(babelOptions, { cache: false, only: app.sides.server.paths });
  require('babel-register')(babelOptions); // eslint-disable-line global-require
  return app;
}

// Enables command-line functions for the Cater App objects - as specified
// in ./src/commands.js
function readyCommandLine() {
  const commands = require('./src/commands'); // eslint-disable-line global-require
  return Object.assign(BuildCater.prototype, commands);
}

// Returns the test harness.
function testHarness() {
  return require('./src/harness.js'); // eslint-disable-line global-require
}

const exporting = { readyCommandLine, testHarness };
module.exports = Object.assign(index, exporting);
