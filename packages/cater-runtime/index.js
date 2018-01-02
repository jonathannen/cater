// Copyright Jon Williams 2017-2018. See LICENSE file.
const BabelOptions = require('./src/options-babel.js');
const fs = require('fs');
const path = require('path');
const HandlerCater = require('./src/handler-cater');
const HttpServer = require('./src/http-server');
const Middleware = require('./src/middleware');
const RuntimeCater = require('./src');

function loadConfig(file = null) {
  const configFile = file || path.join(process.cwd(), 'cater.config.js');
  if (!fs.existsSync(configFile)) return {};
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const options = require(configFile);

  if (options.env) {
    const env = options.env[process.env.NODE_ENV];
    if (env) Object.assign(options, env);
  }

  return options;
}

function index(options = null) {
  const caterOptions = options || loadConfig();

  if (caterOptions.disableBabel) {
    const babelOptions = BabelOptions();
    babelOptions.ignore = /\/node_modules\//;
    require('babel-register')(babelOptions); // eslint-disable-line global-require
  }
  return new RuntimeCater(caterOptions);
}

function readyCommandLine() {
  const commands = require('./src/commands'); // eslint-disable-line global-require
  return Object.assign(RuntimeCater.prototype, commands);
}

const exporting = {
  BabelOptions,
  HandlerCater,
  HttpServer,
  loadConfig,
  Middleware,
  readyCommandLine
};
module.exports = Object.assign(index, exporting);
