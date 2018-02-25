// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const webpackGenerator = require('./webpack-generator');

/**
 * Resolves the given partial filename source name "app/blah" in the given
 * paths ["/hello/world", "/hello/other"] with the given extensions [".js",
 * ".jsx"].
 */
function resolveWithPaths(source, paths, extensions, startFromPath = null) {
  const ext = path.extname(source).toLowerCase();
  const exts = ext.length > 0 ? [''] : extensions;
  let startMatching = startFromPath === null;

  for (let i = 0; i < paths.length; i += 1) {
    const modulePath = paths[i];
    for (let j = 0; j < exts.length; j += 1) {
      const extension = exts[j];
      const potential = path.join(modulePath, source + extension);
      if (startMatching && fs.existsSync(potential)) return potential;
      if (potential === startFromPath) startMatching = true;
    }
  }

  // With the app and ^ caret style imports there is a chance of a cycle
  // in the import/require. Throw an error if we detect a loop
  if (startFromPath && startFromPath === source) {
    throw Error(`Resolving ${source} imported itself. Aborting to prevent an infinite loop.`);
  }

  return source;
}

/**
 * A side configuration represents a "side" in the sense of "server-side" or
 * "client-side". This is largely the paths used to generate the differences
 * between the two.
 */
class SideConfiguration {
  constructor(context, options, sideName) {
    this.name = sideName;
    this.extensions = options.extensions;

    // Can be extended with other sides down the line
    this.typeClient = this.name === 'client';
    this.typeServer = this.name === 'server';

    this.configurePaths(context);
    this.configureBabel(context);
    this.configureBundle(context, options);
    this.configureWebpack(context);

    // Used to split caret ^ type imports
    const prefixes = Object.keys(this.importPrefixResolvers);
    this.caretPathSplitRegex = new RegExp(`/(${prefixes.join('|')})/`);

    // Files that have been required
    this.requiredFileList = [];
  }

  configureBabel(context) {
    this.importPrefixResolvers = {
      app: this.resolve.bind(this)
    };
    this.importPrefixResolvers[this.name] = this.resolveSide.bind(this);

    this.babel = clone(context.babel);
    this.babel.only = this.paths; // TODO: This'll take some thinking
    this.babel.resolveModuleSource = this.resolveBabel.bind(this);
  }

  configureBundle(app, options) {
    const bundleFilename = this.typeServer ? options.serverBundleFilename : options.bundleFilename;
    this.bundleName = path.parse(bundleFilename).name; // "bundle.js" to "bundle"
    this.bundlePath = `${options.publicPath}${bundleFilename}`;
  }

  configurePaths(context) {
    this.assetPaths = [path.join(context.appRootPath, 'assets')]; // TODO Issue #1
    this.sidePaths = context.generatePaths([this.name]);

    this.paths = context.generatePaths(context.universalNames.concat([this.name]));
    this.entryPath = this.resolve(context.entryScriptFilename);
  }

  configureWebpack(context) {
    this.webpackConfig = webpackGenerator(context, this);
    return this.webpackConfig;
  }

  /**
   * Resolves the given source file name from the paths defined on this side.
   */
  resolve(source, startFromPath = null) {
    return resolveWithPaths(source, this.paths, this.extensions, startFromPath);
  }

  /**
   * Hook for any babel-side requirements.
   */
  resolveBabel(source, filename) {
    const result = this.resolveBabelInternal(source, filename);
    if (!this.requiredFileList.includes(result)) this.requiredFileList.push(result);
    return result;
  }

  /**
   * Resolves a file using babel rules. Most resolutions will pass straight
   * through. However, examples like app/app will resolve according to the
   * path rules of this side.
   */

  resolveBabelInternal(providedSource, filename) {
    let source = providedSource;

    // Does this have a querystring? If so there might be other actions to
    // perform. One is hackery from jest that let's use obtain the filename
    // context that is otherwise lost.
    if (source.includes('?')) {
      const [, start, end] = providedSource.split(/^(.*)\?(.*)$/);
      const query = querystring.parse(end);
      source = start;

      // Some jest plumbing will pass in 'module.js?filename=xxxx' to
      // get the filename context. This is necessary for cater-style univeral
      // wrappering.
      // eslint-disable-next-line no-param-reassign, prefer-destructuring
      if (!filename && query.filename) filename = query.filename;
    }

    // Handle /app/* and similar imports
    const prefixes = Object.keys(this.importPrefixResolvers);
    for (let i = 0; i < prefixes.length; i += 1) {
      const prefix = prefixes[i];
      if (source.startsWith(`${prefix}/`)) {
        let base = source.substring(prefix.length + 1);
        let startFromPath = null;

        // The caret symbol means the component is requesting it's
        // prior priority component. So if you were in custom/server/layout.js
        // this would return the original cater/server/layouts.js. Useful
        // for wrappering.
        if (base === '^') {
          startFromPath = filename;
          base = filename.split(this.caretPathSplitRegex).pop();
        }

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
