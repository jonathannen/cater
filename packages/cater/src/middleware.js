// Copyright Jon Williams 2017. See LICENSE file.
import caterMiddleware from "./cater-middleware";
import logging from "./logging-middleware";
import staticMiddleware from "./static-middleware";
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

/**
 * Set up a chain of middleware based upon the current server-side
 * configuration. Always returns as a Promise. In debug this promise
 * means the client and server side webpack compilations (first run)
 * are complete.
 */
const generate = function(context) {
  const config = context.sides.server;

  const entryPath = context.debug
    ? config.entryPath
    : context.productionEntryPath;

  const cater = caterMiddleware(
    entryPath,
    context.bundlePath,
    context.options.publicPath
  );

  // Non-debug (production) skips direct to the cater middleware
  if (!context.debug) {
    const statics = staticMiddleware(
      context.options.publicPath,
      context.staticPath
    );

    // const handlers = [caterHandler, staticHandler, notFoundHandler];
    const handlers = [cater, statics, notFoundHandler];
    const handler = function(req, res, next = null) {
      middlewareHandler(req, res, handlers);
      if (next !== null) next();
    };
    return Promise.resolve(handler);
  }

  // Otherwise enable request logging along with webpack middleware
  const promise = webpackMiddleware(context, cater.reload).then(
    webpack => {
      const handlers = [logging, cater, webpack, notFoundHandler];
      return function(req, res, next = null) {
        middlewareHandler(req, res, handlers);
        if (next !== null) next();
      };
    }
  );
  return promise;
};

export default generate;
