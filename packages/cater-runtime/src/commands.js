// Copyright Jon Williams 2017-2018. See LICENSE file.

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

// Starts a production server
function runStart() {
  return Promise.resolve(this.start());
}

module.exports = { runStart };
