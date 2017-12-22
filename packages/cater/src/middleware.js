// Copyright Jon Williams 2017. See LICENSE file.
import caterMiddleware from "./cater-middleware";
import logging from "./logging-middleware";
import staticMiddleware from "./static-middleware";
import staticMiddlewareDev from './static-middleware-dev';
import webpackMiddleware from "./webpack-middleware";

/**
 * Simple HTTP handler that chains together other middleware-style
 * handlers. Used in non-production cases to enable things like
 * logging and webpack compilation.
 */
export const middlewareHandler = function(req, res, handlers) {
  const queue = handlers.slice(0); // Clone handler list
  const next = () => {
    var handler = queue.shift();
    if (handler === undefined) return true;
    handler.bind(this)(req, res, next);
  };
  return next();
};

/**
 * Final handler that's called if no other middleware responds. Generates
 * a 404 and cleans up.
 */
const notFoundHandler = function(req, res, handlers) {
  if (res.finished) return; // Boundary check if the response has actually been sent
  res.writeHead(404);
  res.end();
};

const generateDebug = function(context) {
  const client = context.sides.client;
  const server = context.sides.server;

  const bundlePath = client.bundlePath;
  const entryPath = server.entryPath;
  const cater = caterMiddleware(entryPath, bundlePath, context.publicPath);
  const staticHandler = staticMiddlewareDev(context.devStaticPath);

  const promise = webpackMiddleware(context, cater.reload).then(webpack => {
    let handlers = [logging];
    if(context.devStaticPathExists) handlers.push(staticHandler);
    handlers = handlers.concat([cater, webpack, notFoundHandler]);
    console.log(handlers);

    return function(req, res, next = null) {
      middlewareHandler(req, res, handlers);
      if (next !== null) next();
    };
  });
  return promise;
};

const generateProduction = function(context) {
  const client = context.sides.client;
  const server = context.sides.server;

  const bundlePath = client.productionPublicBundlePath;
  const entryPath = server.productionBundlePath;
  const cater = caterMiddleware(entryPath, bundlePath, context.publicPath);

  const statics = staticMiddleware(context.publicPath, context.staticPath);

  // const handlers = [caterHandler, staticHandler, notFoundHandler];
  const handlers = [cater, statics, notFoundHandler];
  const handler = function(req, res, next = null) {
    middlewareHandler(req, res, handlers);
    if (next !== null) next();
  };
  return Promise.resolve(handler);
};

/**
 * Set up a chain of middleware based upon the current server-side
 * configuration. Always returns as a Promise. In debug this promise
 * means the client and server side webpack compilations (first run)
 * are complete.
 */
const generate = function(context) {
  const generator = context.debug ? generateDebug : generateProduction;
  return generator(context);
};

export default generate;
