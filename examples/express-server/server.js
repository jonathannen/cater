// Copyright Jon Williams 2017-2018. See LICENSE file.
const cater = require("cater");
const express = require("express");

// An express server
const server = express();

// Add in some other routes, to make it interesting
server.get("/express", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("This page is rendered directly in Express.");
});

module.exports = server;
