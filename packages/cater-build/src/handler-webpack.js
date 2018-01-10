// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const DEFAULT_WEBPACK_WATCH_OPTIONS = {
  inline: true,
  logLevel: 'warn',
  stats: { colors: true }
};

/**
 * Returns a Promise that'll complete based upon the initial webpack
 * compilation. In the resolved case it'll provide the http.Handler for
 * the webpack client side development server.
 */
function generateHandler(app, reloadCallback = null) {
  const compiler = webpack(app.sides.client.webpackConfig);
  app.triggerWebpackCompiling(compiler);

  let etag = null;
  const client = new Promise((resolve, reject) => {
    compiler.plugin('done', (result) => {
      app.triggerRetry('client');
      etag = null;
      // Check for client side errors
      if (result.hasErrors()) {
        console.error('Webpack (Client) compilation failed.'); // eslint-disable-line no-console
        app.triggerErrors('client', result.compilation.errors);
        return reject(result.compilation.errors);
      }
      // Client side appears all clear
      app.triggerWebpackCompiled(result);

      // Next check if there is an error reloading on the server side. Note
      // this isn't a chained promise as the enclosing promise is intended
      // to run once at startup. This runs everytime Webpack does.
      reloadCallback()
        .then(() => {
          // This is the happy path - client and server are ready and no errors
          app.triggerResolution(); // *All* error states are cleared down

          etag = `W/"${result.hash}-${new Date().getTime()}"`;
          // Success! Set the etag and notify any listeners
          // eslint-disable-next-line no-console
          console.log('Webpack and server compilation succeeded');
          return resolve(compiler);
        })
        .catch((error) => reject(error));

      return true;
    });
  });

  // Good to go. Get the Webpack middlewares set up
  const watchOptions = clone(DEFAULT_WEBPACK_WATCH_OPTIONS);
  watchOptions.hot = app.hotModuleReplacement;
  watchOptions.publicPath = app.publicPath;

  const devMiddleware = webpackDevMiddleware(compiler, watchOptions);
  let hotMiddleware = null;
  if (watchOptions.hot) {
    // eslint-disable-next-line global-require
    const webpackHotMiddleware = require('webpack-hot-middleware');
    hotMiddleware = webpackHotMiddleware(compiler, { reload: true });
  }

  // Webpack development bundles tend to be large. We can ETag them
  // in development.
  const cachingHandler = function cachingHandler(req, res, providedNext) {
    if (etag !== null) {
      res.setHeader('ETag', etag);
      const ifNoneMatch = req.headers['if-none-match'];
      if (!!ifNoneMatch && ifNoneMatch !== '*' && ifNoneMatch === etag) {
        res.statusCode = 304; // File still matches
        return res.end();
      }
    }

    // If necessary, add the hot middleware into the middleware chain
    let next = providedNext;
    if (watchOptions.hot) next = () => hotMiddleware(req, res, providedNext);
    return devMiddleware(req, res, next);
  };

  // Returned promise waits for both the client and server compilations
  // to complete. The promise will return the handler to the webpack
  // development server.
  const handlerPromise = client.then(() => cachingHandler);

  // If start on error is set cature errors, otherwise pass to the next promise catch
  if (!app.startOnError) return handlerPromise;
  return handlerPromise.catch(() => {
    // eslint-disable-next-line no-console
    console.error('Error detected on App start - Server will still start as startOnError is set.');
    return cachingHandler;
  });
}

module.exports = generateHandler;
