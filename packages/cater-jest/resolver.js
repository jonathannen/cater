// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const path = require("path");
const Cater = require("cater");
const Resolver = require("jest-resolve");

// Cache of Cater applications.
const _cache = {};

/**
 * Used for integration and workspace-style Cater testing. This resolves files
 * relative to the test configuration in use.
 */
module.exports = function(moduleName, opts) {
  let result = Resolver.findNodeModule(moduleName, opts);

  // Find the root directory of this test, if available.
  if (result === null) {
    const rootPath = opts.rootDir || global.rootPath || process.cwd();
    global.rootPath = rootPath;

    let cater = _cache[rootPath];
    if(!cater) cater = _cache[rootPath] = new Cater({ appRootPath: rootPath });

    result = cater.sides.server.babel.resolveModuleSource(moduleName);
  }
  return result;
};
