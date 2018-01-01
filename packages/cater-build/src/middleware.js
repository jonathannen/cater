// Copyright Jon Williams 2017-2018. See LICENSE file.
const handlerCater = require('./handler-cater');
const handlerLogging = require('./handler-logging');
const handlerStatic = require('./handler-static');
const handlerWebpack = require('./handler-webpack');

const Middleware = require('cater-runtime').Middleware;

/**
 * Similar to the production cater-runtime middleware, but adds in logging and
 * the webpack compilation process.
 */
const generate = function(context) {
  const client = context.sides.client;
  const server = context.sides.server;

  const cater = handlerCater(server.entryPath, client.bundlePath, context.publicPath);
  const logging = handlerLogging();

  return handlerWebpack(context, cater.reload).then((webpack) => {
    let handlers = [logging, cater, webpack, Middleware.notFoundHandler];
    if (context.devStaticPathExists) {
      const _static = handlerStatic(context.debug, context.publicPath, context.devStaticPath);
      handlers.splice(1, 0, _static);
    }
    return Middleware(handlers);
  });
};

module.exports = generate;
