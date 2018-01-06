// Copyright Jon Williams 2017-2018. See LICENSE file.
const handlerCater = require('./handler-cater');
const { HandlerLogging } = require('cater-runtime');
const handlerStatic = require('./handler-static');
const handlerWebpack = require('./handler-webpack');
const { Middleware } = require('cater-runtime');

/**
 * Similar to the production cater-runtime middleware, but adds in logging and
 * the webpack compilation process.
 */
function generate(app) {
  const cater = handlerCater(app);
  const logging = HandlerLogging();

  return handlerWebpack(app, cater.reload).then((webpack) => {
    const handlers = [logging, cater, webpack, Middleware.notFoundHandler];
    if (app.devStaticPathExists) {
      const aStatic = handlerStatic(app.publicPath, app.devStaticPath);
      handlers.splice(1, 0, aStatic);
    }
    return Middleware(handlers);
  });
}

module.exports = generate;
