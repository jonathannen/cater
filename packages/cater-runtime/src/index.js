// A stripped down version of the Cater object.
const fs = require("fs");
const http = require("http");
require("http-shutdown").extend();
const Middleware = require("./middleware");
const path = require("path");
const readline = require("readline");

const MANIFEST_FILENAME = "manifest.json";

const loadManifest = function(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Expected to find manifest.json at ${file}. Have you run a cater build?`);
  }
  return JSON.parse(fs.readFileSync(file).toString());
};

class Cater {
  constructor(options) {
    const defaultOptions = {
      appRootPath: process.cwd(),
      buildDirectory: "build", // TODO
      bundlePath: "",
      clientBundleFile: "bundle.js", // TODO
      entryPath: "",
      httpPort: 3000,
      publicPath: "/static/",
      serverBundleFile: "server-bundle.js", // TODO
      serveStaticAssets: true
    };

    this.options = options = Object.assign(defaultOptions, options);

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
    const HandlerCater = require("./handler-cater");
    const cater = HandlerCater(this.serverBundlePath, this.bundlePath, this.publicPath);
    let handlers = [cater, Middleware.handlerNotFound];

    if (this.options.serveStaticAssets) {
      const HandlerStatic = require("./handler-static");
      const _static = HandlerStatic(this.publicPath, this.staticPath, this.clientManifest);
      handlers = [_static, cater, Middleware.handlerNotFound];
    }

    return Promise.resolve(Middleware(handlers));
  }

  start() {
    return this.handler().then(handler => {
      const httpServer = http.createServer(handler).withShutdown();
      httpServer.listen(this.httpPort, err => {
        if (err) throw err;
        console.log(`Listening on http://localhost:${this.httpPort}`);

        // Allow a graceful quit. Requires hitting space twice
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        let lastKey = null;
        process.stdin.on("keypress", (str, key) => {
          if(lastKey == true) return; // Shutting down
          if (key.ctrl && key.name === "c") {
            process.exit(-1); // Awkward...
          }

          if (key.name === "space") {
            if (lastKey === "space") {
              httpServer.shutdown(() => process.exit(0));
              return lastKey = true;
            }
            console.log("Press space again to exit.");
          }
          lastKey = key.name;
        });

      });
      return false;
    });
  }
}

module.exports = Cater;
