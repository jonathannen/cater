// A stripped down version of the Cater object.
const DefaultOptions = require('./options-default');
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
  constructor(providedOptions) {
    super();
    const options = DefaultOptions(providedOptions);

    // In general options are used to configure the object - they shouldn't
    // be used after configuration. Following are some values used directly.
    this.configureRuntimeDefaults(options);
    this.assetHost = options.assetHost;
    this.publicPath = options.publicPath;
    this.httpPort = options.httpPort;
    this.mode = options.mode;
    this.renderer = options.renderer;

    if (this.mode === 'runtime') this.configureRuntime(options);
  }

  cleanOptions() {
    // Fix up the asset host so that it always ends without the slash
    if (this.assetHost) {
      // Will convert https://cdn.example.org/ to https://cdn.example.org
      // Or https://cdn.example.org///// to the same.
      this.assetHost = this.assetHost.replace(/\/*$/g, '');
    }
    this.options = null; // Don't use options post configuration
  }

  configureRuntimeDefaults(options) {
    this.appRootPath = options.appRootPath || process.cwd();
    this.caterRuntimePath = path.join(__dirname, '..');
    this.buildPath = path.join(this.appRootPath, options.buildDirectory);
  }

  configureRuntime(options) {
    this.serveStaticAssets = options.serveStaticAssets;
    this.staticPath = path.join(this.buildPath, options.publicPath);
    this.loadManifests();
    this.bundlePath = path.join(options.publicPath, this.clientManifest[options.bundleFilename]);
    this.serverBundlePath = path.join(
      this.buildPath,
      this.serverManifest[options.serverBundleFilename]
    );
    this.cleanOptions();
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
