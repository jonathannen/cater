// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const path = require("path");
const Cater = require("cater");
const Resolver = require("jest-resolve");

module.exports = function(moduleName, opts) {
  let result = Resolver.findNodeModule(moduleName, opts);

  if (result === null) {
    const rootPath = global.rootPath || opts.rootPath;
    if (!global.cater || global.cater.appRootPath !== rootPath) {
      global.cater = new Cater({ appRootPath: rootPath });
    }
    result = global.cater.sides.server.babel.resolveModuleSource(moduleName);
  }
  return result;
};
