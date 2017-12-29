// Copyright Jon Williams 2017. See LICENSE file.
const RuntimeCater = require('./index');

module.exports.runStart = function() {
  return Promise.resolve(this.start());
};
