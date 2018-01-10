// Copyright Jon Williams 2017-2018. See LICENSE file.
const webpack = require('webpack');

function builder(config, context) {
  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (stats.hasErrors()) return reject(stats.compilation.errors);
      if (context) context.triggerWebpackCompiled(stats);
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
function build(context) {
  const client = context.sides.client.webpackConfig;
  const server = context.sides.server.webpackConfig;

  // The builder is sequential rather than using the Webpack Multi-Compiler.
  // This is necessary as the server uses the final assets (such as images,
  // stylesheets) from the client.
  return builder(client, context).then(() => builder(server));
}

module.exports = build;
