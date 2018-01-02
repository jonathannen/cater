// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');
const defaultOptions = require('./context-options.js');
const { autoDefinePlugins, configurePlugins } = require('./context-plugins.js');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const SideConfiguration = require('./context-side.js');

const events = {
  configured: 'configured',
  webpackCompiled: 'webpack-compiled',
  webpackCompiling: 'webpack-compiling'
};

class Cater extends EventEmitter {
  constructor(options) {
    super();

    // Deep-clone the defaults in case we mutate arrays/etc in the options.
    // Then set up the most criticial and widely used pieces.
    Object.assign(this, clone(defaultOptions), clone(options));
    this.appRootPath = this.appRootPath || process.cwd();
    this.assignProgrammaticDefaults();
    this.loadPackage();

    if (this.plugins === 'auto') this.plugins = autoDefinePlugins(this);
    this.configuredPlugins = configurePlugins(this); // Get plugins ready

    // Assign derived options
    this.assignPaths();
    this.configureSides();

    this.emit(events.configured, this); // EVENT
  }

  assignProgrammaticDefaults() {
    this.caterRootPath = path.join(__dirname, '..');
    this.caterRuntimePath = path.dirname(require.resolve('cater-runtime'));
    this.debug = process.env.NODE_ENV !== 'production';
  }

  assignPaths() {
    this.buildPath = path.join(this.appRootPath, this.buildDirectory);

    this.pluginPaths = Object.values(this.configuredPlugins)
      .map((v) => v.componentRootPath)
      .filter((v) => !!v);

    this.rootPaths = [
      this.appRootPath,
      ...this.pluginPaths,
      this.caterRootPath,
      this.caterRuntimePath
    ].filter((v) => fs.existsSync(v));

    this.staticPath = path.join(this.buildPath, this.publicPath);
    this.devStaticPath = path.join(this.appRootPath, this.staticDirectory);
    this.universalPaths = this.generatePaths(this.universalNames);

    if (fs.existsSync(this.devStaticPath)) this.devStaticPathExists = true;
  }

  configureSides() {
    this.sides = {};
    for (let i = 0; i < this.sideNames.length; i += 1) {
      const name = this.sideNames[i];
      this.sides[name] = new SideConfiguration(this, name);
    }
  }

  generatePaths(directories) {
    const result = [];
    for (let i = 0; i < this.rootPaths.length; i += 1) {
      const root = this.rootPaths[i];
      for (let j = 0; j < directories.length; j += 1) {
        const dir = directories[j];
        const candidate = path.join(root, dir);
        if (fs.existsSync(candidate)) result.push(candidate);
      }
    }
    return result;
  }

  loadPackage() {
    this.package = {};
    const packageFile = path.join(this.appRootPath, 'package.json');
    if (fs.existsSync(packageFile)) {
      const content = fs.readFileSync(packageFile).toString();
      this.package = JSON.parse(content);
    }
    return this.package;
  }

  /**
   * Returns a http.Handler for this application.
   */
  handler() {
    // TODO
    const Middleware = require('./middleware'); // eslint-disable-line global-require
    return Middleware(this);
  }

  /*
   * Inversion that is triggered when a client-side webpack is successfully
   * compiled. Can be used by plugins to take post-compilation actions.
   */
  callbackWebpackCompiled(stats) {
    this.emit(events.webpackCompiled, this, stats);
  }

  callbackWebpackCompiling(compiler) {
    this.emit(events.webpackCompiling, this, compiler);
  }

  start() {
    // TODO
    const { Middleware } = require('cater-runtime'); // eslint-disable-line global-require
    return this.handler().then((handler) => {
      Middleware.httpServer(handler, this.httpPort);
    });
  }
}

Cater.prototype.prepareCommandLine = function prepareCommandLine() {
  const commands = require('./commands.js'); // eslint-disable-line global-require
  Object.assign(Cater.prototype, commands);
  return true;
};

module.exports = Cater;
