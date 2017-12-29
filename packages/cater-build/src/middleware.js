// Copyright Jon Williams 2017. See LICENSE file.
import handlerCater from "./handler-cater";
import handlerLogging from "./handler-logging";
import handlerStatic from "./handler-static";
import handlerWebpack from "./handler-webpack";

/**
 * Simple HTTP handler that chains together other middleware-style
 * handlers.
 */
export const middlewareHandler = function(handlers) {
  return function(req, res, outerNext) {
    const queue = handlers.slice(0); // Clone handler list
    const next = () => {
      var handler = queue.shift();
      if (!handler) return outerNext ? outerNext : false;
      handler.bind(this)(req, res, next);
    };
    return next();
  };
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

  const cater = handlerCater(server.entryPath, client.bundlePath, context.publicPath);
  const logging = handlerLogging();

  return handlerWebpack(context, cater.reload).then(webpack => {
    let handlers = [logging, cater, webpack, notFoundHandler];
    if (context.devStaticPathExists) {
      const _static = handlerStatic(context.debug, context.publicPath, context.devStaticPath);
      handlers.splice(1, 0, _static);
    }
    return middlewareHandler(handlers);
  });
};

const generateProduction = function(context) {
  const client = context.sides.client;
  const server = context.sides.server;

  const cater = handlerCater(server.productionBundlePath, client.productionPublicBundlePath, context.publicPath);

  const _static = handlerStatic(context.debug, context.publicPath, context.staticPath);

  const handler = middlewareHandler([cater, _static, notFoundHandler]);
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
