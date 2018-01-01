// Copyright Jon Williams 2017-2018. See LICENSE file.
const http = require('http');
const httpShutdown = require('http-shutdown').extend();
const readline = require('readline');

/**
 * HTTP server that will exit on CTRL-C or two space keystrokes.
 */
const generate = function(handler, httpPort) {
  const httpServer = http.createServer(handler).withShutdown();
  httpServer.listen(httpPort, (err) => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${httpPort}`);

    // Allow a graceful quit. Requires hitting space twice
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    let lastKey = null;
    process.stdin.on('keypress', (str, key) => {
      if (lastKey == true) return; // Shutting down
      if (key.ctrl && key.name === 'c') {
        httpServer.shutdown(() => process.exit(0));
        return (lastKey = true);
      }

      if (key.name === 'space') {
        if (lastKey === 'space') {
          httpServer.shutdown(() => process.exit(0));
          return (lastKey = true);
        }
        console.log('Press space again to exit.');
      }
      lastKey = key.name;
    });
  });
  return httpServer;
};

module.exports = generate;
