// Copyright Jon Williams 2017. See LICENSE file.
const clone = require("clone");
const defaultOptions = require("./context-options.js");
const { autoDefinePlugins, configurePlugins } = require("./context-plugins.js");
const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const SideConfiguration = require("./context-side.js");

const events = {
  configured: "configured",
  webpackCompiled: "webpack-compiled",
  webpackCompiling: "webpack-compiling",
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

    if(this.plugins == 'auto') autoDefinePlugins(this);
    configurePlugins(this); // Get plugins ready

    // Assign derived options
    this.assignPaths();
    this.configureSides();

    // Built-In and Configured Plugins
    // configureImageLoaders(this);
    // configureCssLoaders(this);

    this.emit(events.configured, this); // EVENT
  }

  assignProgrammaticDefaults() {
    this.caterRootPath = path.join(__dirname, "..");
    this.caterRuntimePath = path.dirname(require.resolve('cater-runtime'));
    this.debug = process.env.NODE_ENV !== "production";
  }

  assignPaths() {
    this.buildPath = path.join(this.appRootPath, this.buildDirectory);

    this.pluginPaths = Object.values(this.configuredPlugins)
      .map(v => v.componentRootPath)
      .filter(v => !!v);

    this.rootPaths = [this.appRootPath, ...this.pluginPaths, this.caterRootPath, this.caterRuntimePath].filter(v => fs.existsSync(v));

    this.staticPath = path.join(this.buildPath, this.publicPath);
    this.devStaticPath = path.join(this.appRootPath, this.staticDirectory);
    this.universalPaths = this.generatePaths(this.universalNames);

    if (fs.existsSync(this.devStaticPath)) this.devStaticPathExists = true;
  }

  configureSides() {
    this.sides = {};
    for (let name of this.sideNames) {
      const config = (this.sides[name] = new SideConfiguration(this, name));
    }
  }

  generatePaths(directories) {
    const result = [];
    for (let root of this.rootPaths)
      for (let dir of directories) {
        const candidate = path.join(root, dir);
        if (fs.existsSync(candidate)) result.push(candidate);
      }
    return result;
  }

  loadPackage() {
    this.package = {};
    const packageFile = path.join(this.appRootPath, 'package.json');
    if(fs.existsSync(packageFile)) {
      const content = fs.readFileSync(packageFile).toString();
      this.package = JSON.parse(content);
    }
    return this.package;
  }

  /**
   * Returns a http.Handler for this application.
   */
  handler() {
    const middleware = require("./middleware").default;
    return middleware(this);
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

}

module.exports = Cater;

Cater.prototype.prepareCommandLine = function() {
  const commands = require("./commands.js");
  Object.keys(commands).forEach(key => (Cater.prototype[key] = commands[key]));
};
