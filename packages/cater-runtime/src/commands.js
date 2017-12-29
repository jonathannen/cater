// Copyright Jon Williams 2017. See LICENSE file.
const RuntimeCater = require('./index');

module.exports.runStart = function() {
  const app = new RuntimeCater();
  return Promise.resolve(app.start());
};
