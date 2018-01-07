import { REGEXP_ABSOLUTE_RESOURCE_PATH } from 'webpack/lib/ModuleFilenameHelpers';

// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

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
  app.callbackWebpackCompiling(compiler);
  let etag = null;

  const client = new Promise((resolve, reject) => {
    compiler.plugin('done', (result) => {
      etag = null;
      if (result.hasErrors()) {
        console.log('Webpack compilation failed.'); // eslint-disable-line no-console
        return reject(result.compilation.errors);
      }
      app.callbackWebpackCompiled(result);

      const success = reloadCallback ? reloadCallback() : true;
      if (!success) {
        console.log('Webpack compilation failed.'); // eslint-disable-line no-console
        return reject(result.compilation.errors);
      }

      etag = `W/"${result.hash}-${new Date().getTime()}"`;
      console.log('Webpack compilation succeeded'); // eslint-disable-line no-console
      return resolve(compiler);
    });
  });

  // Good to go. Start the server.
  const watchOptions = clone(DEFAULT_WEBPACK_WATCH_OPTIONS);
  watchOptions.hot = true; // >>
  watchOptions.publicPath = app.publicPath;

  const devMiddleware = webpackDevMiddleware(compiler, watchOptions);

  // Enable Hot Module Replacement, if enabled
  const hotMiddleware = app.hotModuleReplacement
    ? webpackHotMiddleware(compiler, { reload: REGEXP_ABSOLUTE_RESOURCE_PATH })
    : null;

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
    if (app.hotModuleReplacement) next = () => hotMiddleware(req, res, next);

    return devMiddleware(req, res, next);
  };

  // Returned promise waits for both the client and server compilations
  // to complete. The promise will return the handler to the webpack
  // development server.
  return client.then(() => cachingHandler).catch((err) => {
    console.error(err); // eslint-disable-line no-console
    process.exit(-1);
  });
}

module.exports = generateHandler;
