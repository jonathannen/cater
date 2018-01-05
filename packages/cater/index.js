// Copyright Jon Williams 2017-2018. See LICENSE file.

/**
 * # ^ Cater
 *
 * The cater module is the Command-line interface (cli) to Cater. It also
 * provides wrappering around the cater-build and cater-runtime modules.
 *
 * The cater-runtime module is always included. It contains the minimum
 * configuration to run cater; including in production. The cater-build
 * module should be a development dependency. It's added to develop and
 * build a Cater application.
 *
 * @module cater
 * @see module:cater-build
 * @see module:cater-runtime
 */

// Determine if we're using the runtime or build versions of cater. Returns
// that module, depending on the setup.
const mode = process.env.CATER_MODE || (process.env.NODE_ENV === 'production' ? 'runtime' : 'dev');
const runtime = mode === 'runtime';
const moduleName = runtime ? 'cater-runtime' : 'cater-build';

try {
  if (!runtime) require.resolve(moduleName);
} catch (e) {
  throw new Error(
    "Running Cater in build mode, but the cater-build package isn't installed. Add to your project as a development dependency using npm or yarn."
  );
}

// eslint-disable-next-line global-require, import/no-dynamic-require
module.exports = require(moduleName);
