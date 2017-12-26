// Copyright Jon Williams 2017. See LICENSE file.
const clone = require("clone");
const configureImageLoaders = require('./context-images');
const defaultOptions = require("./context-options.js");
const fs = require("fs");
const path = require("path");
const plugins = require("../plugins");
const SideConfiguration = require("./context-side.js");

class Cater {
  constructor(options) {
    this.assignProgrammaticDefaults();

    // Deep-clone the defaults in case we mutate arrays/etc in the options
    Object.assign(this, clone(defaultOptions), clone(options));

    // Assign derived options
    this.assignPaths();
    this.configureSides();

    // Built-In Plugins
    configureImageLoaders(this);

    this.plugins = plugins.configure(this);
    this.plugins.postConfiguration(this); // EVENT: Post-Configuration
  }

  assignProgrammaticDefaults() {
    this.caterRootPath = path.join(__dirname, "..");
    this.debug = process.env.NODE_ENV !== "production";
    this.production = !this.debug; // better than having error-prone "!debug" everywhere
  }

  assignPaths() {
    this.appRootPath = this.appRootPath || process.cwd();
    this.buildPath = path.join(this.appRootPath, this.buildDirectory);
    this.rootPaths = [this.appRootPath, this.caterRootPath];
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

  clientSides() {
    return Object.values(this.sides).filter(s => s.typeClient);
  }

  serverSides() {
    return Object.values(this.sides).filter(s => s.typeServer);
  }

  /**
   * Returns a http.Handler for this application.
   */
  handler() {
    const middleware = require("./middleware").default;
    return middleware(this);
  }
}

module.exports = Cater;

Cater.prototype.prepareCommandLine = function() {
  const commands = require('./commands.js');
  Object.keys(commands).forEach((key) => Cater.prototype[key] = commands[key] );
}
