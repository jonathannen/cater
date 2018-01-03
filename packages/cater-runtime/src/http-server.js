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

    /* // Allow a graceful quit. Requires hitting space twice
    TODO: Deprecated for now
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    let lastKey = null;
    process.stdin.on('keypress', (str, key) => {
      if (lastKey === true) return; // Shutting down
      if (key.ctrl && key.name === 'c') {
        httpServer.shutdown(() => process.exit(0));
        lastKey = true;
        return;
      }

      if (key.name === 'space') {
        if (lastKey === 'space') {
          httpServer.shutdown(() => process.exit(0));
          lastKey = true;
        }
        // eslint-disable-next-line no-console
        console.log('Press space again to exit.');
      }
      lastKey = key.name;
    }); */
  });
  return httpServer;
}

module.exports = generate;
