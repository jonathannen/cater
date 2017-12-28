// A stripped down version of the Cater object.
const fs = require('fs');
const HandlerCater = require('./handler-cater');
const HandlerStatic = require('./handler-static');
const http = require('http');
const Middleware = require('./middleware');
const path = require('path');

const MANIFEST_FILENAME = 'manifest.json';

const loadManifest = function(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Expected to find manifest.json at ${file}. Have you run a cater build?`);
  }
  return JSON.parse(fs.readFileSync(file).toString());
}

const start = function() {

  const cater = {
    appRootPath: process.cwd(),
    buildDirectory: 'build', // TODO
    bundlePath: "",
    clientBundleFile: 'bundle.js', // TODO
    entryPath: "",
    httpPort: 3000,
    publicPath: "/static/",
    serverBundleFile: 'server-bundle.js', // TODO
    serveStaticAssets: true,
  }

  const buildPath = path.join(cater.appRootPath, cater.buildDirectory);
  const staticPath = path.join(buildPath, cater.publicPath);

  const clientManifest = loadManifest(path.join(staticPath, MANIFEST_FILENAME));
  const serverManifest = loadManifest(path.join(buildPath, MANIFEST_FILENAME));
  const bundlePath = path.join(cater.publicPath, clientManifest[cater.clientBundleFile]);
  const serverBundlePath = path.join(buildPath, serverManifest[cater.serverBundleFile]);

  // const server = require(serverBundlePath);

  const handlerCater = HandlerCater(serverBundlePath, bundlePath, cater.publicPath);
  const handlerStatic = HandlerStatic(cater.publicPath, staticPath);
  const handlers = [handlerStatic, handlerCater, Middleware.handlerNotFound];

  // Start the server
  const handler = Middleware(handlers);
  const httpServer = http.createServer(handler);
  httpServer.listen(cater.httpPort, err => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${cater.httpPort}`);
  });
  return false;

}

module.exports = start;
