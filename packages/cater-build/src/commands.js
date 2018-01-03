// Copyright Jon Williams 2017-2018. See LICENSE file.
const fs = require('fs-extra');
const path = require('path');
const Runtime = require('cater-runtime');
const webpackBuild = require('./webpack-build');

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
 *
 * @module cater/commands
 */

// Returns a promise to a production build of the application.
function runBuild() {
  return fs
    .remove(this.buildPath)
    .then(() => {
      if (this.devStaticPathExists) {
        const prodStaticPath = path.join(this.buildPath, this.publicPath);
        return fs.copy(this.devStaticPath, prodStaticPath);
      }
      return Promise.resolve(true);
    })
    .then(() => webpackBuild(this));
}

// Used as a hook to signal deployment - particularly to any plugins.
function runDeploy() {
  return Promise.resolve(this.callbackDeploy());
}

// Runs the development server - that's a server with webpack in-memory
// building (and reloading) the client and server code.
function runDev() {
  return this.handler().then((h) => Runtime.HttpServer(h, this.httpPort));
}

module.exports = { runBuild, runDeploy, runDev };
