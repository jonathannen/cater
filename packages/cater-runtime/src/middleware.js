// Copyright Jon Williams 2017-2018. See LICENSE file.

/**
 * Simple HTTP handler that chains together other middleware-style
 * handlers.
 *
 * Example Usage:
 *
 *     const Middleware = require('cater-runtime').Middleware;
 *     const handlers = [ <array of http.Handlers>, Middleware.handlerNotFound ];
 *     const handler = Middleware(handlers);
 *     const httpServer = http.createServer(handler);
 *     httpServer.listen(...);
 */
function generateHandler(handlers) {
  return function handler(req, res, outerNext) {
    const queue = handlers.slice(0); // Clone handler list
    const next = () => {
      const nextHandler = queue.shift();
      if (!nextHandler) return outerNext;
      nextHandler.bind(this)(req, res, next);
      return true;
    };
    return next();
  };
}

/**
 * Final handler that's called if no other middleware responds. Generates
 * a 404 and cleans up.
 */
function handlerNotFound(req, res) {
  if (res.finished) return; // Boundary check if the response has actually been sent
  res.writeHead(404);
  res.end();
}

generateHandler.handlerNotFound = handlerNotFound;
module.exports = generateHandler;
