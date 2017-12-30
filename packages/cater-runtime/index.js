// Copyright Jon Williams 2017. See LICENSE file.
const BabelOptions = require("./src/options-babel.js");
const fs = require("fs");
const path = require("path");
const HandlerCater = require("./src/handler-cater");
const HttpServer = require("./src/http-server");
const Middleware = require("./src/middleware");
const RuntimeCater = require("./src");

const index = function(options = null) {
  options = options || loadConfig();

  if (!!options.disableBabel) {
    const babelOptions = BabelOptions();
    babelOptions.ignore = /\/node_modules\//;
    require("babel-register")(babelOptions);
  }
  return new RuntimeCater(options);
};

const loadConfig = function(file = null) {
  file = file || path.join(process.cwd(), "cater.config.js");
  if (!fs.existsSync(file)) return {};
  const options = require(file);

  if (!!options.env) {
    const env = options.env[process.env.NODE_ENV];
    if (!!env) Object.assign(options, env);
  }

  return options;
};

const readyCommandLine = function() {
  const commands = require("./src/commands");
  return Object.assign(RuntimeCater.prototype, commands);
};

const exporting = { BabelOptions, HandlerCater, HttpServer, loadConfig, Middleware, readyCommandLine };
module.exports = Object.assign(index, exporting);
