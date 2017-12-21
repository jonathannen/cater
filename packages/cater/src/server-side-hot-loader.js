// Copyright Jon Williams 2017. See LICENSE file.
import path from "path";

/**
 * This Webpack loader will reload modules that have been generated in the
 * running node instance. The modules will still need to be require()'d
 * again.
 */
module.exports = function(source, map) {
  this.cacheable(false);
  delete require.cache[this.resourcePath];
  var result = this.exec(source, this.resourcePath);
  this.callback(null, source, map);
  return;
};
