// Copyright Jon Williams 2017-2018. See LICENSE file.
const DefaultOptions = require('./options-default.js');
const fs = require('fs');
const path = require('path');
const Plugins = require('./plugins.js');
const { RuntimeCater } = require('cater-runtime');
const SideConfiguration = require('./context-side.js');

const events = {
  configuring: 'configuring',
  configured: 'configured',
  deploying: 'deploying',
  webpackCompiled: 'webpack-compiled',
  webpackCompiling: 'webpack-compiling'
};

class BuildCater extends RuntimeCater {
  constructor(providedOptions) {
    const options = DefaultOptions(providedOptions);
    super(options);

    this.configureBuildDefaults();
    this.configuredPlugins = Plugins(this, options);

    this.babel = options.babel;
    this.entryScriptFilename = options.entryScriptFilename;
    this.universalNames = options.universalNames;

    // EVENT: I know we're already configuring, but this is for the benefit
    // of the plugins - which have only just been set up.
    this.emit(events.configuring, this, options);

    // Set up the key paths and get the client and server sides ready
    this.configurePaths(options);
    this.configureSides(options);

    // EVENT: Allow plugins to make changes at the end of the configuration
    // cycle
    this.emit(events.configured, this, options);
    this.cleanOptions();
  }

  configurePaths(options) {
    this.pluginPaths = Object.values(this.configuredPlugins)
      .map((v) => v.componentRootPath)
      .filter((v) => v);

    this.rootPaths = [
      this.appRootPath,
      ...this.pluginPaths,
      this.caterRootPath,
      this.caterRuntimePath
    ].filter((v) => fs.existsSync(v));

    this.staticPath = path.join(this.buildPath, this.publicPath);
    this.universalPaths = this.generatePaths(options.universalNames);

    // This is used to set up serving directly from /static in dev mode
    this.devStaticPath = path.join(this.appRootPath, options.staticDirectory);
    if (fs.existsSync(this.devStaticPath)) this.devStaticPathExists = true;
  }

  configureBuildDefaults() {
    this.caterRootPath = path.join(__dirname, '..');
  }

  configureSides(options) {
    this.sides = {};
    for (let i = 0; i < options.sideNames.length; i += 1) {
      const name = options.sideNames[i];
      this.sides[name] = new SideConfiguration(this, options, name);
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

  /**
   * Returns a http.Handler for this application.
   */
  handler() {
    // TODO
    const Middleware = require('./middleware'); // eslint-disable-line global-require
    return Middleware(this);
  }

  package(bail = false) {
    const packageFile = path.join(this.appRootPath, 'package.json');
    if (!fs.existsSync(packageFile)) {
      if (!bail) return {};
      throw new Error(`Could not load package.json at ${packageFile}`);
    }
    return JSON.parse(fs.readFileSync(packageFile).toString());
  }

  callbackDeploy() {
    this.emit(events.deploying, this);
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

BuildCater.prototype.prepareCommandLine = function prepareCommandLine() {
  const commands = require('./commands.js'); // eslint-disable-line global-require
  Object.assign(BuildCater.prototype, commands);
  return true;
};

module.exports = BuildCater;
