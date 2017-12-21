// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const path = require("path");
const Context = require("cater").Context;
const Resolver = require("jest-resolve");

module.exports = function(moduleName, opts) {
  let result = Resolver.findNodeModule(moduleName, opts);

  if (result === null) {
    const rootPath = global.rootPath || opts.rootPath;
    if (!global.context || global.context.appRootPath !== rootPath) {
      global.context = new Context({ appRootPath: rootPath });
    }
    result = global.context.sides.server.babel.resolveModuleSource(moduleName);
  }
  return result;
};
