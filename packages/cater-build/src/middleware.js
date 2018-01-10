// Copyright Jon Williams 2017-2018. See LICENSE file.
const handlerCater = require('./handler-cater');
const handlerErrors = require('./handler-errors');
const { HandlerLogging, Middleware } = require('cater-runtime');
const handlerStatic = require('./handler-static');
const handlerWebpack = require('./handler-webpack');

/**
 * Similar to the production cater-runtime middleware, but adds in logging and
 * the webpack compilation process.
 *
 * @module cater-build/middleware
 */

// Returns a Promise that resolves to a http.Handler.
function generate(app) {
  const cater = handlerCater(app);
  const errors = handlerErrors(app);
  const logging = HandlerLogging();

  return handlerWebpack(app, cater.reload).then((webpack) => {
    const handlers = [logging, errors, cater, webpack, Middleware.notFoundHandler];
    // TODO: Should be always on - and detect if the path becomes active
    if (app.devStaticPathExists) {
      const aStatic = handlerStatic(app.publicPath, app.devStaticPath);
      handlers.splice(1, 0, aStatic);
    }
    return Middleware(handlers);
  });
}

module.exports = generate;
