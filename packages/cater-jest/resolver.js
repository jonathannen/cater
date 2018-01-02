// Copyright Jon Williams 2017-2018. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const Cater = require('cater');
const Resolver = require('jest-resolve');

// Cache of Cater applications.
const internalConfigCache = {};

/**
 * Used for integration and workspace-style Cater testing. This resolves files
 * relative to the test configuration in use.
 */
function generate(moduleName, opts) {
  let result = Resolver.findNodeModule(moduleName, opts);

  // Find the root directory of this test, if available.
  if (result === null) {
    const rootPath = opts.rootDir || global.rootPath || process.cwd();
    global.rootPath = rootPath;

    let cater = internalConfigCache[rootPath];
    if (!cater) cater = new Cater({ appRootPath: rootPath });
    internalConfigCache[rootPath] = cater;

    result = cater.sides.server.babel.resolveModuleSource(moduleName);
  }
  return result;
}

module.exports = generate;
