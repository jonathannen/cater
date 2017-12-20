// Copyright Jon Williams 2017. See LICENSE file.
import del from "del";
import http from "http";
import middleware from "./middleware";
import webpackBuild from "./webpack-build";

/**
 * The class shared when cater is used API-level as a library.
 */
class CaterFramework {

  constructor(context) {
    this.context = context;



  }

  // Produces a production build
  build() {
    // The build directory gets nuked, then kick off webpack
    return del(this.context.buildPath)
      .then(() => {
        return webpackBuild(this.context);
      })
  }

  // Returns a Promise to the HTTP.Handler for the application
  handler() {
    return middleware(this.context);
  }

  // Runs the development server - that's a server with webpack in-memory
  // building (and reloading) the client and server code.
  runDevelopmentServer() {
    return this.handler().then(handler => this.runGenericServer(handler));
  }

  // Runs a production server - that's a server that expects the build
  // of the client and server sides to already be sitting in the build
  // directory, ready to be served.
  runProductionServer() {
    this.context.debug = false;
    return this.handler().then(handler => this.runGenericServer(handler));
  }

  // Runs a generic server, given a http.Handler
  runGenericServer(handler) {
    const options = this.context.options;
    const httpServer = http.createServer(handler);
    httpServer.listen(options.httpPort, err => {
      if (err) throw err;
      console.log(`Listening on http://localhost:${options.httpPort}`);
    });
    return false;
  }
}

export default CaterFramework;
