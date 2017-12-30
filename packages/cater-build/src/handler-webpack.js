// Copyright Jon Williams 2017. See LICENSE file.
import clone from "clone";
import generator from "./webpack-generator";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";

const DEFAULT_WEBPACK_WATCH_OPTIONS = {
  inline: true,
  logLevel: "warn",
  stats: { colors: true }
};

/**
 * Returns a Promise that'll complete based upon the initial webpack
 * compilation. In the resolved case it'll provide the http.Handler for
 * the webpack client side development server.
 */
const generateHandler = function(context, reloadCallback = null) {
  const compiler = webpack(context.sides.client.webpackConfig);
  context.callbackWebpackCompiling(compiler);
  let etag = null;

  const client = new Promise((resolve, reject) => {
    compiler.plugin("done", result => {
      etag = null;
      if (result.hasErrors()) {
        console.log(`Webpack compilation failed.`);
        return reject(result.compilation.errors);
      }
      context.callbackWebpackCompiled(result);

      const success = reloadCallback ? reloadCallback() : true;
      if (!success) {
        console.log(`Webpack compilation failed.`);
        return reject(result.compilation.errors);
      }

      etag = `W/"${result.hash}-${new Date().getTime()}"`;
      console.log(`Webpack compilation succeeded`);
      resolve(compiler);
    });
  });

  // Good to go. Start the server.
  const watchOptions = clone(DEFAULT_WEBPACK_WATCH_OPTIONS);
  watchOptions.publicPath = context.publicPath;
  const middleware = webpackDevMiddleware(compiler, watchOptions);

  // Webpack development bundles tend to be large. We can ETag them
  // in development.
  const cachingHandler = function(req, res, next) {
    if(etag !== null) {
      res.setHeader('ETag', etag);
      const ifNoneMatch = req.headers["if-none-match"];
      if (!!ifNoneMatch && ifNoneMatch !== "*" && ifNoneMatch === etag) {
        res.statusCode = 304; // File still matches
        return res.end();
      }
    }

    return middleware(req, res, next);
  }

  // Returned promise waits for both the client and server compilations
  // to complete. The promise will return the handler to the webpack
  // development server.
  return client.then(() => cachingHandler).catch(err => {
    console.error(err);
    process.exit(-1);
  });
};

export default generateHandler;
