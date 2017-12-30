// Copyright Jon Williams 2017. See LICENSE file.
const fs = require("fs-extra");
const http = require("http");
const path = require("path");
const Runtime = require("cater-runtime");
const webpackBuild = require("./webpack-build");

/**
 * Mixin that enables CLI-commands directly in the Cater App. Enabled
 * via the readyCommandLine function from the cater-build package.
 *
 * All methods return a promise.
 *
 * Example Usage - Assumes cater-build is installed.
 *
 *     const cater = require('cater');
 *     cater.readyCommandLine();
 *     const app = cater();
 *     app.runBuild();
 */

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
};

// Runs the development server - that's a server with webpack in-memory
// building (and reloading) the client and server code.
module.exports.runDev = function() {
  return this.handler().then(h => Runtime.Middleware.httpServer(h, this.httpPort));
};
