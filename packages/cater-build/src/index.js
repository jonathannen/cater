// Copyright Jon Williams 2017-2018. See LICENSE file.
const Build = require('./build');
const { Config, RuntimeCater } = require('cater-runtime');
const DefaultConfig = require('./config-default.js');
const fs = require('fs-extra');
const path = require('path');
const Plugins = require('./plugins.js');
const SideConfiguration = require('./context-side.js');
const webpackBuild = require('./webpack-build');

const events = {
  building: 'building',
  built: 'built',
  configuring: 'configuring',
  configured: 'configured',
  deploying: 'deploying',
  webpackCompiled: 'webpack-compiled',
  webpackCompiling: 'webpack-compiling'
};

class BuildCater extends RuntimeCater {
  constructor(providedConfig) {
    const config = Config(providedConfig, DefaultConfig());
    super(config);

    this.configureBuildDefaults();
    this.configuredPlugins = Plugins(this, config);

    this.babel = config.babel;
    this.entryScriptFilename = config.entryScriptFilename;
    this.hotModuleReplacement = config.hotModuleReplacement;
    this.universalNames = config.universalNames;

    // EVENT: I know we're already configuring, but this is for the benefit
    // of the plugins - which have only just been set up.
    this.emit(events.configuring, this, config);

    // Set up the key paths and get the client and server sides ready
    this.configurePaths(config);
    this.configureSides(config);

    // EVENT: Allow plugins to make changes at the end of the configuration
    // cycle
    this.emit(events.configured, this, config);
    this.cleanConfig();
  }

  // Returns a build as a Promise object
  build() {
    const currentBuild = new Build(this.buildPath);

    return fs
      .remove(this.buildPath) // rm -rf ./build
      .then(() => fs.mkdirp(this.buildPath)) // mkdir ./build
      .then(() => {
        this.emit(events.building, this, currentBuild);
        if (this.devStaticPathExists) {
          const prodStaticPath = path.join(this.buildPath, this.publicPath);
          return fs.copy(this.devStaticPath, prodStaticPath); // cp -r ./static ./build/static
        }
        return Promise.resolve(true);
      })
      .then(() => webpackBuild(this)) // webpack -out ./build
      .then(() => {
        this.emit(events.built, this, currentBuild);
        return Promise.resolve(currentBuild);
      });
  }

  configurePaths(config) {
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
    this.universalPaths = this.generatePaths(config.universalNames);

    // This is used to set up serving directly from /static in dev mode
    this.devStaticPath = path.join(this.appRootPath, config.staticDirectory);
    if (fs.existsSync(this.devStaticPath)) this.devStaticPathExists = true;
  }

  configureBuildDefaults() {
    this.caterRootPath = path.join(__dirname, '..');
  }

  configureSides(config) {
    this.sides = {};
    for (let i = 0; i < config.sideNames.length; i += 1) {
      const name = config.sideNames[i];
      this.sides[name] = new SideConfiguration(this, config, name);
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

  // Returns all the "sides" of this application, as an array of string. This
  // will typically return `['app', 'client', 'server', 'assets']`.
  listSides() {
    // Assets hardcoded. See https://github.com/clashbit/cater/issues/1
    return Object.values(this.sides)
      .map((s) => s.name)
      .concat(this.universalNames)
      .concat('assets');
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

  callbackWebpackCompiled(stats) {
    this.emit(events.webpackCompiled, this, stats);
  }

  callbackWebpackCompiling(compiler) {
    this.emit(events.webpackCompiling, this, compiler);
  }

  // Kicks of the dev-time server
  start() {
    // TODO
    const { Middleware } = require('cater-runtime'); // eslint-disable-line global-require
    return this.handler().then((handler) => {
      Middleware.httpServer(handler, this.httpPort);
    });
  }

  // Trigger that an error has occurred at dev or build time
  triggerBuildError(error) {
    console.error(error); // eslint-disable-line no-console
    this.error = error;
  }
}

BuildCater.prototype.prepareCommandLine = function prepareCommandLine() {
  const commands = require('./commands.js'); // eslint-disable-line global-require
  Object.assign(BuildCater.prototype, commands);
  return true;
};

module.exports = BuildCater;
