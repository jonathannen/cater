// Copyright Jon Williams 2017-2018. See LICENSE file.
const EventEmitter = require('events');
const fs = require('fs');
const HttpServer = require('./http-server');
const Middleware = require('./middleware');
const path = require('path');

const MANIFEST_FILENAME = 'manifest.json';

function loadManifest(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Expected to find manifest.json at ${file}. Have you run a cater build?`);
  }
  return JSON.parse(fs.readFileSync(file).toString());
}

class RuntimeCater extends EventEmitter {
  constructor(config) {
    super();

    // In general options are used to configure the object - they shouldn't
    // be used after configuration. Following are some values used directly.
    this.configureRuntimeDefaults(config);
    this.assetHost = config.assetHost;
    this.publicPath = config.publicPath;
    this.httpPort = config.httpPort;
    this.mode = config.mode;
    this.renderer = config.renderer;

    if (this.mode === 'runtime') this.configureRuntime(config);
  }

  cleanConfig() {
    // Fix up the asset host so that it always ends without the slash
    if (this.assetHost) {
      // Will convert https://cdn.example.org/ to https://cdn.example.org
      // Or https://cdn.example.org///// to the same.
      this.assetHost = this.assetHost.replace(/\/*$/g, '');
    }
    this.options = null; // Don't use options post configuration
  }

  configureRuntimeDefaults(config) {
    this.appRootPath = config.appRootPath || process.cwd();
    this.caterRuntimePath = path.join(__dirname, '..');
    this.buildPath = path.join(this.appRootPath, config.buildDirectory);
  }

  configureRuntime(config) {
    // If static assets is set, this overrides everything else. Otherwise
    // if the CDN (assetHost) is configured, the serving is off - on otherwise.
    if (config.serveStaticAssets) {
      this.serveStaticAssets = true;
    } else {
      this.serveStaticAssets = !this.assetHost;
    }

    this.staticPath = path.join(this.buildPath, config.publicPath);

    this.loadManifests();
    const clientBundle = this.clientManifest[config.bundleFilename];
    const serverBundle = this.serverManifest[config.serverBundleFilename];
    this.bundlePath = path.join(config.publicPath, clientBundle);
    this.serverBundlePath = path.join(this.buildPath, serverBundle);

    this.cleanConfig();
  }

  handler() {
    const HandlerCater = require('./handler-cater'); // eslint-disable-line global-require
    const cater = HandlerCater(
      this.renderer,
      this.serverBundlePath,
      this.bundlePath,
      this.publicPath,
      this.assetHost
    );
    let handlers = [cater, Middleware.handlerNotFound];

    if (this.serveStaticAssets) {
      const HandlerStatic = require('./handler-static'); // eslint-disable-line global-require
      const aStatic = HandlerStatic(this.publicPath, this.staticPath, this.clientManifest);
      handlers = [aStatic, cater, Middleware.handlerNotFound];

      // If you need to enable logging in production.
      // const logging = require('./handler-logging')(); // eslint-disable-line global-require
      // handlers = [logging, aStatic, cater, Middleware.handlerNotFound];
    }

    return Promise.resolve(Middleware(handlers));
  }

  loadManifests() {
    if (!this.clientManifest) {
      this.clientManifest = loadManifest(path.join(this.staticPath, MANIFEST_FILENAME));
      this.serverManifest = loadManifest(path.join(this.buildPath, MANIFEST_FILENAME));
    }
    return this.clientManifest; // Usually the one we're interested in
  }

  start() {
    return this.handler().then((handler) => {
      HttpServer(handler, this.httpPort);
    });
  }
}

module.exports = RuntimeCater;
