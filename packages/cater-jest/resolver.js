const path = require("path");
const cater = require("cater");
const Resolver = require("jest-resolve");

module.exports = function(moduleName, opts) {
  let result = Resolver.findNodeModule(moduleName, opts);

  if (result === null) {
    const context = cater.createContext(global.rootDir || opts.rootDir);
    result = context.sides.server.babelOptions.resolveModuleSource(moduleName);
  }
  return result;
};
