// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const path = require("path");
const Cater = require("cater");
const Resolver = require("jest-resolve");

const _cache = {};

module.exports = function(moduleName, opts) {
  let result = Resolver.findNodeModule(moduleName, opts);

  if (result === null) {
    const rootPath = opts.rootDir || global.rootPath || process.cwd();
    global.rootPath = rootPath;

    let cater = _cache[rootPath];
    if(!cater) cater = _cache[rootPath] = new Cater({ appRootPath: rootPath });

    result = cater.sides.server.babel.resolveModuleSource(moduleName);
  }
  return result;
};
