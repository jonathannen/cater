// Copyright Jon Williams 2017. See LICENSE file.
const RuntimeCater = require('./index');

/**
 * Mixin that enables CLI-commands directly in the Cater App. Enabled
 * via the readyCommandLine function from the cater-runtime package.
 *
 * All methods return a promise.
 *
 * Example Usage:
 *
 *     const cater = require('cater');
 *     cater.readyCommandLine();
 *     const app = cater();
 *     app.runStart();
 */

module.exports.runStart = function() {
  return Promise.resolve(this.start());
};
