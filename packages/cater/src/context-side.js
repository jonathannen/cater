// Copyright Jon Williams 2017. See LICENSE file.
const clone = require("clone");
const fs = require("fs");
const path = require("path");
const webpackGenerator = require("./webpack-generator");

const ASSET_PATH = "assets";

/**
 * Resolves the given partial filename source name "app/blah" in the given
 * paths ["/hello/world", "/hello/other"] with the given extensions [".js",
 * ".jsx"].
 */
const resolveWithPaths = function(source, paths, extensions) {
  const ext = path.extname(source).toLowerCase();
  const exts = ext.length > 0 ? [""] : extensions;

  for (let modulePath of paths)
    for (let extension of exts) {
      const potential = path.join(modulePath, source + extension);
      if (fs.existsSync(potential)) return potential;
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
    this.typeClient = this.name == 'client';
    this.typeServer = this.name == 'server';

    this.assignPaths(context);
    this.configureBabel(context);

    this.bundleName = path.parse(context.bundleFilename).name; // bundle.js -> bundle
    this.bundlePath = `${context.publicPath}${context.bundleFilename}`;
    if(this.typeServer) {
      this.bundleName = `server-${this.bundleName}`;
      this.bundlePath = `${context.publicPath}server-${context.bundleFilename}`;
    }

    if(context.production) this.configureProduction(context);

    this.webpackConfig = webpackGenerator(context, this);
  }

  assignPaths(context) {
    this.assetPaths = [path.join(context.appRootPath, 'assets')];
    this.sidePaths = context.generatePaths([this.name]);
    this.paths = context.universalPaths.concat(this.sidePaths);
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
    if(this.typeClient) {
      this.productionPath = path.join(context.buildPath, context.publicPath);
    } else {
      this.productionPath = context.buildPath;
    }

    this.loadManifest();

    if(this.hasManifest()) {
      this.productionBundleFile = this.resolveAsset(path.basename(this.bundlePath));
      this.productionPublicBundlePath = path.join(context.publicPath, this.productionBundleFile);
      this.productionBundlePath = path.join(this.productionPath, this.productionBundleFile);
    }
  }

  hasManifest() {
    return this.manifest || false;
  }

  loadManifest() {
    this.manifestPath = path.join(this.productionPath, 'manifest.json');
    if (!fs.existsSync(this.manifestPath)) return null;
    const content = fs.readFileSync(this.manifestPath).toString();
    this.manifest = JSON.parse(content);
  }

  /**
   * Resolves the given source file name from the paths defined on this side.
   */
  resolve(source) {
    return resolveWithPaths(source, this.paths, this.extensions);
  }

  /**
   * Resolve an asset (by default under /build) using the manifest. This will
   * convert a name like bundle.js to bundle.12dd5bb6a286dd70134b.js where
   * the extra value is the hash value from the Webpack generation.
   */
  resolveAsset(source) {
    if (this.manifest === null) return source;
    const result = this.manifest[source];
    if (result === undefined) return source;
    return result;
  }

  /**
   * Resolves a file using babel rules. Most resolutions will pass straight
   * through. However, examples like app/app will resolve according to the
   * path rules of this side.
   */
  resolveBabel(source, filename) {

    // Handle /asset/* imports
    if(source.startsWith(ASSET_PATH)) {
      let result = null;
      this.assetPaths.forEach((assetPath) => {
        const base = source.substring(ASSET_PATH.length + 1);
        const candidate = path.join(assetPath, base);
        if(fs.existsSync(candidate)) result = candidate;
      });
      if(result !== null) return result;
    }

    // Handle /app/* and similar imports
    for (let prefix of Object.keys(this.importPrefixResolvers)) {
      if (source.startsWith(`${prefix}/`)) {
        const base = source.substring(prefix.length + 1);
        const resolve = this.importPrefixResolvers[prefix];
        const result = this.resolve(base);
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
