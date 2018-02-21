// Copyright Jon Williams 2017-2018. See LICENSE file.
const http = require('http');

/**
 * HTTP server that will exit on CTRL-C or two space keystrokes.
 */
function generate(handler, httpPort) {
  const httpServer = http.createServer(handler);
  httpServer.listen(httpPort, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`Listening on http://localhost:${httpPort}`);
  });
  return httpServer;
}

module.exports = generate;
