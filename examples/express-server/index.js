// Copyright Jon Williams 2017-2018. See LICENSE file.
const cater = require('cater');
const express = require('express');

// The Cater "app" is a parcel of all the different parts of a Cater-based
// Application. The handler returns a Promise that can be used by most
// http.Handler based frameworks. Following is an example using express.
const app = cater();
const port = app.httpPort || 3000;

// An express server
const server = express();

// Add in some other routes, to make it interesting
server.get('/express', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('This page is rendered directly in Express.');
});

// Get the http.Handler from Cater and kick off the express server
app
  .handler()
  .then((handler) => {
    server.get('*', handler);
    server.listen(port, (err) => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`Express+Cater listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err); // eslint-disable-line no-console
    process.exit(-1);
  });
