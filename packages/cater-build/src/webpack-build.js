// Copyright Jon Williams 2017-2018. See LICENSE file.
const webpack = require('webpack');

function builder(app, side) {
  const config = side.webpackConfig;
  const compiler = webpack(config);
  app.triggerWebpackCompiling(side, compiler);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (stats.hasErrors()) return reject(stats.compilation.errors);
      if (app) app.triggerWebpackCompiled(stats);
      return resolve(stats);
    });
  });
}

/**
 * Returns a Promise to a Webpack build to the filesystem. Default
 * options will output the server bundle to
 * <project>/build/server-bundle.[hash].js and the client to
 * <project>/build/static/bundle.[hash].js.
 *
 * Take a look at the production build at cater/examples/production-build.
 */
function build(app) {
  // The builder is sequential rather than using the Webpack Multi-Compiler.
  // This is necessary as the server uses the final assets (such as images,
  // stylesheets) from the client.
  const { client, server } = app.sides;
  return builder(app, client).then(() => builder(app, server));
}

module.exports = build;
