// Copyright Jon Williams 2017. See LICENSE file.
// import del from "del";
import http from "http";
import webpackBuild from "./webpack-build";

// Returns a promise to a production build of the application.
module.exports.runBuild = function() {
  this.build = true;
  // The build directory gets nuked, then kick off webpack
  // return del(this.buildPath).then(() => {
  //   return webpackBuild(this);
  // });
  return Promise.resolve(true);
};

// Runs the development server - that's a server with webpack in-memory
// building (and reloading) the client and server code.
module.exports.runDev = function() {
  return this.handler().then(h => this.runGenericServer(h));
};

module.exports.runStart = function() {
  this.debug = false;
  return this.handler().then(h => this.runGenericServer(h));
}

// Runs a generic server, given a http.Handler
module.exports.runGenericServer = function(handler) {
  const httpServer = http.createServer(handler);
  httpServer.listen(this.httpPort, err => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${this.httpPort}`);
  });
  return false;
};
