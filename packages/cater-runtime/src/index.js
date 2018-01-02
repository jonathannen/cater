// A stripped down version of the Cater object.
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

class Cater {
  constructor(providedOptions) {
    const defaultOptions = {
      appRootPath: process.cwd(),
      buildDirectory: 'build', // TODO
      bundlePath: '',
      clientBundleFile: 'bundle.js', // TODO
      entryPath: '',
      httpPort: 3000,
      publicPath: '/static/',
      serverBundleFile: 'server-bundle.js', // TODO
      serveStaticAssets: true
    };

    const options = Object.assign(defaultOptions, providedOptions);
    this.options = options;

    const buildPath = path.join(options.appRootPath, options.buildDirectory);
    const staticPath = path.join(buildPath, options.publicPath);

    this.clientManifest = loadManifest(path.join(staticPath, MANIFEST_FILENAME));
    const serverManifest = loadManifest(path.join(buildPath, MANIFEST_FILENAME));

    this.publicPath = options.publicPath;
    this.staticPath = staticPath;
    this.bundlePath = path.join(options.publicPath, this.clientManifest[options.clientBundleFile]);
    this.serverBundlePath = path.join(buildPath, serverManifest[options.serverBundleFile]);
    this.httpPort = options.httpPort;
  }

  handler() {
    const HandlerCater = require('./handler-cater'); // eslint-disable-line global-require
    const cater = HandlerCater(this.serverBundlePath, this.bundlePath, this.publicPath);
    let handlers = [cater, Middleware.handlerNotFound];

    if (this.options.serveStaticAssets) {
      const HandlerStatic = require('./handler-static'); // eslint-disable-line global-require
      const aStatic = HandlerStatic(this.publicPath, this.staticPath, this.clientManifest);
      handlers = [aStatic, cater, Middleware.handlerNotFound];
    }

    return Promise.resolve(Middleware(handlers));
  }

  start() {
    return this.handler().then((handler) => {
      HttpServer(handler, this.httpPort);
    });
  }
}

module.exports = Cater;
