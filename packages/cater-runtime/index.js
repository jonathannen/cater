// Copyright Jon Williams 2017-2018. See LICENSE file.
const Config = require('./src/config');
const DefaultConfig = require('./src/config-default.js');
const HandlerCater = require('./src/handler-cater');
const HandlerLogging = require('./src/handler-logging');
const HttpServer = require('./src/http-server');
const Middleware = require('./src/middleware');
const RuntimeCater = require('./src');
const ServerContext = require('./src/server-context');

/**
 * The runtime guts of a Cater application. This module is automatically
 * bought in by the {@link module/cater}.
 *
 * @see module/cater.
 */

function index(providedConfig = null) {
  const config = Config(providedConfig, DefaultConfig());

  if (config.babelRegisterDisable) {
    const babelConfig = config.babel;
    babelConfig.ignore = /\/node_modules\//;
    require('babel-register')(babelConfig); // eslint-disable-line global-require
  }
  return new RuntimeCater(config);
}

function readyCommandLine() {
  const commands = require('./src/commands'); // eslint-disable-line global-require
  return Object.assign(RuntimeCater.prototype, commands);
}

const exporting = {
  Config,
  DefaultConfig,
  HandlerCater,
  HandlerLogging,
  HttpServer,
  Middleware,
  readyCommandLine,
  RuntimeCater,
  ServerContext
};
module.exports = Object.assign(index, exporting);
