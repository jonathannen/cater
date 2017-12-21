// Copyright Jon Williams 2017. See LICENSE file.
const fs = require("fs");
const path = require("path");
const plugins = require("../plugins");

// Babel options common to client and server sides
const UNIVERSAL_BABEL_OPTIONS = {
  presets: ["env", "react"],
  plugins: [["add-module-exports"], ["transform-class-properties"]]
};

const isDebug = function() {
  return process.env.NODE_ENV !== "production";
};

/**
 * Resolves the given partial filename source name "app/blah" in the given
 * paths ["/hello/world", "/hello/other"] with the given extensions [".js",
 * ".jsx"].
 */
const resolveWithPaths = function(source, paths, extensions) {
  const ext = path.extname(source).toLowerCase();
  const exts = ext.length > 0 ? [""] : extensions;

  for (let modulePath of paths) {
    for (let extension of exts) {
      const potential = path.join(modulePath, source + extension);
      if (fs.existsSync(potential)) return potential;
    }
  }
  return source;
};

// Options represents the non-calculated fields for the context.
const options = {
  appComponentName: "App.js",
  buildDirectory: "build",
  bundleFilename: "bundle.js",
  bundlePublicPath: "/static/",
  entryScriptName: "_entry.js", // Webpack needs an "entry" for generating a bundle
  extensions: ["", ".js", ".jsx"],
  httpPort: 3000,
  hot: true,
  layoutComponentName: "Layout.js",
  plugins: ["emotion"],
  publicPath: "/static/",
  sideNames: ["client", "server"],
  universal: ["app"],
  universalPrefix: "app"
};

// Represents the configuration for the client or server side.
class SideConfiguration {
  constructor(context, side) {
    this.side = side;
    const options = context.options;
    this.extensions = options.extensions;
    this.isClient = this.side == "client";
    this.isServer = this.side == "server";

    this.sidePaths = context.generatePaths([side]);
    this.paths = context.universalPaths.concat(this.sidePaths);
    this.bundlePath = `${options.bundlePublicPath}${options.bundleFilename}`;
    this.entryPath = this.resolve(options.entryScriptName);

    this.bundleName = path.parse(options.bundleFilename).name;
    if (this.isServer)
      this.bundleName = "__serverside_" + this.bundleName;
    this.productionEntryPath = path.join(context.buildPath, this.bundleName);

    // Configure the manifest if we're in non-debug mode
    this.manifest = null;
    if (!context.debug) {
      let manifestPath = this.isClient
        ? path.join(
            context.buildPath,
            context.options.publicPath,
            "manifest.json"
          )
        : path.join(context.buildPath, "manifest.json");
      this.manifest = this.loadManifest(manifestPath);
    }
  }

  // Like resolve, but assumes specifically in production manifest situations
  asset(source) {
    if (this.manifest === null) return source;
    const result = this.manifest[source];
    if (result === undefined) return source;
    return result;
  }

  loadManifest(manifestFile) {
    if (!fs.existsSync(manifestFile)) return null;
    const content = fs.readFileSync(manifestFile).toString();
    return JSON.parse(content);
  }

  resolve(source) {
    return resolveWithPaths(source, this.paths, this.extensions);
  }

  resolveSide(source) {
    return resolveWithPaths(source, this.sidePaths, this.extensions);
  }
}

class Context {
  constructor(options) {
    this.options = options;
    this.plugins = plugins.configure(this);

    this.appRootPath = options.appRootPath || process.cwd();
    this.buildPath = path.join(this.appRootPath, options.buildDirectory);
    this.caterRootPath = path.join(__dirname, '..');
    this.debug = isDebug(this);

    this.rootPaths = [this.appRootPath, this.caterRootPath];
    this.universalPaths = this.generatePaths(options.universal);
    this.staticPath = path.join(this.buildPath, options.publicPath);

    this.sides = {};
    for (let sideName of options.sideNames) {
      const sideConfig = (this.sides[sideName] = new SideConfiguration(
        this,
        sideName
      ));
      sideConfig.babelOptions = this.generateBabelOptions(sideConfig);
    }

    // Babel Configurtion for the running node instance.
    // Disables caching as it'll conflict if multiple cater applications
    // are used.
    this.babelOptions = Object.assign(
      { cache: false },
      this.sides.server.babelOptions
    );

    this.importPrefixResolvers = {
      app: side => side.resolve.bind(side),
      client: () => this.sides.client.resolveSide.bind(this.sides.client),
      server: () => this.sides.server.resolveSide.bind(this.sides.server)
    };

    // Handle special assets
    if (this.debug) {
      this.bundlePath = this.sides.client.bundlePath;
      this.productionEntryPath = this.sides.server.productionEntryPath;
    } else {
      this.bundlePath = this.productionEntryPath = path.join(
        this.options.publicPath,
        this.sides.client.asset(options.bundleFilename));
      this.productionEntryPath = path.join(
        this.buildPath,
        this.sides.server.asset(this.sides.server.bundleName + '.js')
      );
    }

    plugins.postContext(this);
  }

  generateBabelOptions(sideConfig) {
    const babel = Object.assign({}, UNIVERSAL_BABEL_OPTIONS);
    babel.resolveModuleSource = this.generateBabelResolveModuleSource(
      sideConfig
    );
    return babel;
  }

  generateBabelResolveModuleSource(side) {
    return (source, filename) => {
      for (let prefix of Object.keys(this.importPrefixResolvers)) {
        if (source.startsWith(`${prefix}/`)) {
          const base = source.substring(prefix.length + 1);
          const resolve = this.importPrefixResolvers[prefix];
          const result = resolve(side)(base);
          return result;
        }
      }
      return source;
    };
  }

  generatePaths(dirNames) {
    const result = [];
    for (let root of this.rootPaths) {
      for (let dir of dirNames) {
        const candidate = path.join(root, dir);
        if (fs.existsSync(candidate)) result.push(candidate);
      }
    }
    return result;
  }

  resolve(source, side = "server") {
    return this.resolveWithPaths(
      source,
      this.sides[side].paths,
      this.options.extensions
    );
  }
}

const createContext = function(appRootPath = null) {
  const opts = Object.assign({ appRootPath }, options);
  return new Context(opts);
};

module.exports = createContext;
