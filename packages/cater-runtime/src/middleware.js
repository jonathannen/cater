// Copyright Jon Williams 2017. See LICENSE file.
const http = require("http");
const httpShutdown = require("http-shutdown").extend();
const readline = require("readline");

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
*      httpServer.listen(...);
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

/**
 * HTTP server that will exit on two keystrokes
 */
const httpServer = function(handler, httpPort) {

  const httpServer = http.createServer(handler).withShutdown();
  httpServer.listen(httpPort, err => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${httpPort}`);

    // Allow a graceful quit. Requires hitting space twice
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    let lastKey = null;
    process.stdin.on("keypress", (str, key) => {
      if(lastKey == true) return; // Shutting down
      if (key.ctrl && key.name === "c") {
        process.exit(-1); // Awkward...
      }

      if (key.name === "space") {
        if (lastKey === "space") {
          httpServer.shutdown(() => process.exit(0));
          return lastKey = true;
        }
        console.log("Press space again to exit.");
      }
      lastKey = key.name;
    });

  });
  return httpServer;
}

module.exports = generateHandler;
module.exports.handlerNotFound = handlerNotFound;
module.exports.httpServer = httpServer;
