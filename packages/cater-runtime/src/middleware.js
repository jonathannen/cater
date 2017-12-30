// Copyright Jon Williams 2017. See LICENSE file.

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
const generateHandler = function(handlers) {
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
const handlerNotFound = function(req, res, handlers) {
  if (res.finished) return; // Boundary check if the response has actually been sent
  res.writeHead(404);
  res.end();
};

module.exports = generateHandler;
module.exports.handlerNotFound = handlerNotFound;
