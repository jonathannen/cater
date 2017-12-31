// Copyright Jon Williams 2017. See LICENSE file.
const clone = require("clone");
const fs = require("fs");
const path = require("path");
const webpackGenerator = require("./webpack-generator");

const ASSET_PATH = "assets";
const CARET_PATH_SEPARATOR = "?filename=";

/**
 * Resolves the given partial filename source name "app/blah" in the given
 * paths ["/hello/world", "/hello/other"] with the given extensions [".js",
 * ".jsx"].
 */
const resolveWithPaths = function(source, paths, extensions, startFromPath = null) {
  const ext = path.extname(source).toLowerCase();
  const exts = ext.length > 0 ? [""] : extensions;
  let startMatching = startFromPath === null;

  for (let modulePath of paths) {
    for (let extension of exts) {
      const potential = path.join(modulePath, source + extension);
      if (startMatching && fs.existsSync(potential)) return potential;
      if (potential === startFromPath) startMatching = true;
    }
  }

  // With the app and ^ caret style imports there is a chance of a cycle
  // in the import/require. Throw an error if we detect a loop
  if (!!startFromPath && startFromPath === source) {
    throw `Resolving ${source} imported itself. Aborting to prevent an infinite loop.`;
  }

  return source;
};

/**
 * A side configuration represents a "side" in the sense of "server-side" or
 * "client-side". This is largely the paths used to generate the differences
 * between the two.
 */
class SideConfiguration {
  constructor(context, sideName) {
    this.name = sideName;
    this.extensions = context.extensions;

    // Can be extended with other sides down the line
    this.typeClient = this.name == "client";
    this.typeServer = this.name == "server";

    this.assignPaths(context);
    this.configureBabel(context);

    this.bundleName = path.parse(context.bundleFilename).name; // bundle.js -> bundle
    this.bundlePath = `${context.publicPath}${context.bundleFilename}`;
    if (this.typeServer) {
      this.bundleName = `server-${this.bundleName}`;
      this.bundlePath = `${context.publicPath}server-${context.bundleFilename}`;
    }

    if (!context.debug) this.configureProduction(context);

    this.webpackConfig = webpackGenerator(context, this);

    // Used to split caret ^ type imports
    const prefixes = Object.keys(this.importPrefixResolvers);
    this.caretPathSplitRegex = new RegExp(`/(${prefixes.join("|")})/`);
  }

  assignPaths(context) {
    this.assetPaths = [path.join(context.appRootPath, "assets")];
    this.sidePaths = context.generatePaths([this.name]);

    this.paths = context.generatePaths(context.universalNames.concat([this.name]));

    // this.paths = context.universalPaths.concat(this.sidePaths);
    this.entryPath = this.resolve(context.entryScriptFilename);
  }

  configureBabel(context) {
    this.importPrefixResolvers = {
      app: this.resolve.bind(this)
    };
    this.importPrefixResolvers[this.name] = this.resolveSide.bind(this);
    this.babel = clone(context.babel);
    this.babel.resolveModuleSource = this.resolveBabel.bind(this);
  }

  configureProduction(context) {
    if (this.typeClient) {
      this.productionPath = path.join(context.buildPath, context.publicPath);
    } else {
      this.productionPath = context.buildPath;
    }
  }

  /**
   * Resolves the given source file name from the paths defined on this side.
   */
  resolve(source, startFromPath = null) {
    return resolveWithPaths(source, this.paths, this.extensions, startFromPath);
  }

  /**
   * Resolves a file using babel rules. Most resolutions will pass straight
   * through. However, examples like app/app will resolve according to the
   * path rules of this side.
   */
  resolveBabel(source, filename) {
    // Hackery from jest to get the filename context. We could use a
    // querystring approach, but no need just yet.
    if (!filename && source.includes(CARET_PATH_SEPARATOR)) {
      const split = source.split(CARET_PATH_SEPARATOR);
      source = split[0];
      filename = split[1];
    }

    // Handle /asset/* imports for Webpack
    if (this.typeClient) {
      if (source.startsWith(ASSET_PATH)) {
        let result = null;
        this.assetPaths.forEach(assetPath => {
          const base = source.substring(ASSET_PATH.length + 1);
          const candidate = path.join(assetPath, base);
          if (fs.existsSync(candidate)) result = candidate;
        });
        if (result !== null) return result;
      }
    }

    // Handle /app/* and similar imports
    for (let prefix of Object.keys(this.importPrefixResolvers)) {
      if (source.startsWith(`${prefix}/`)) {
        let base = source.substring(prefix.length + 1);
        let startFromPath = null;

        // The caret symbol means the component is requesting it's
        // prior priority component. So if you were in custom/server/layout.js
        // this would return the original cater/server/layouts.js. Useful
        // for wrappering.
        if (base === "^") {
          startFromPath = filename;
          base = filename.split(this.caretPathSplitRegex).pop();
        }

        const resolve = this.importPrefixResolvers[prefix];
        const result = this.resolve(base, startFromPath);
        return result;
      }
    }
    return source;
  }

  /**
   * Resolves the file, but only with side-specific paths. Universal
   * paths are excluded.
   */
  resolveSide(source) {
    return resolveWithPaths(source, this.sidePaths, this.extensions);
  }
}

module.exports = SideConfiguration; // CommonJS
