// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const path = require("path");
const cater = require("cater");
const Resolver = require("jest-resolve");

module.exports = function(moduleName, opts) {
  let result = Resolver.findNodeModule(moduleName, opts);

  if (result === null) {
    const rootDir = global.rootDir || opts.rootDir;
    if(!global.context || global.context.rootDir !== rootDir) {
      const context = global.context = cater.createContext(rootDir);
    }
    result = global.context.sides.server.babelOptions.resolveModuleSource(moduleName);
  }
  return result;
};
