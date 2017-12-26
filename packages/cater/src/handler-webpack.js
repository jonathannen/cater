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

  const client = new Promise((resolve, reject) => {
    compiler.plugin("done", result => {
      if (result.hasErrors()) {
        console.log(`Webpack compilation failed.`);
        return reject(result.compilation.errors);
      }

      const success = reloadCallback ? reloadCallback() : true;
      if (!success) {
        console.log(`Webpack compilation failed.`);
        return reject(result.compilation.errors);
      }

      console.log(`Webpack compilation succeeded`);
      resolve(compiler);
    });
  });

  // Good to go. Start the server.
  const watchOptions = clone(DEFAULT_WEBPACK_WATCH_OPTIONS);
  watchOptions.publicPath = context.publicPath;
  const middleware = webpackDevMiddleware(compiler, watchOptions);

  // Returned promise waits for both the client and server compilations
  // to complete. The promise will return the handler to the webpack
  // development server.
  return client.then(() => middleware).catch(err => {
    console.error(err);
    process.exit(-1);
  });
};

export default generateHandler;
