// Copyright Jon Williams 2017. See LICENSE file.

const HandlerCater = require('./src/handler-cater');
const start = require('./src');

const runtime = function() {
  return start();
}

runtime.HandlerCater = HandlerCater;

module.exports = runtime;
