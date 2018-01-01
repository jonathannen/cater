// Copyright Jon Williams 2017-2018. See LICENSE file.
const express = require('express');

const server = express();

// The Cater "app" is a parcel of all the different parts of a Cater-based
// Application. The handler returns a Promise that can be used by most
// http.Handler based frameworks. Following is an example using express.

// Add in some other routes, to make it interesting
server.get('/express', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('This page is rendered directly in Express.');
});

module.exports = server;
