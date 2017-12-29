// Copyright Jon Williams 2017. See LICENSE file.
import fs from "fs-extra";
import http from "http";
import path from "path";
import Runtime from 'cater-runtime';
import webpackBuild from "./webpack-build";

const catchFatal = function(err) {
  console.error(err);
  process.exit(-1);
};

// Returns a promise to a production build of the application.
module.exports.runBuild = function() {
  return fs
    .remove(this.buildPath)
    .then(() => {
      if (this.devStaticPathExists) {
        const prodStaticPath = path.join(this.buildPath, this.publicPath);
        return fs.copy(this.devStaticPath, prodStaticPath);
      }
      return Promise.resolve(true);
    })
    .then(() => webpackBuild(this))
    .catch(catchFatal);
};

// Runs the development server - that's a server with webpack in-memory
// building (and reloading) the client and server code.
module.exports.runDev = function() {
  return this.handler().then(h => this.runGenericServer(h));
};


// Runs a generic server, given a http.Handler
module.exports.runGenericServer = function(handler) {
  const httpServer = http.createServer(handler);
  httpServer.listen(this.httpPort, err => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${this.httpPort}`);
  });
  return false;
};
