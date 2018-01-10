// Copyright Jon Williams 2017-2018. See LICENSE file.
/* eslint-disable no-param-reassign */
const CompressionPlugin = require('compression-webpack-plugin');
const fs = require('fs');
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

/**
 * Generates a Webpack configuration object for the given App and
 * App side (i.e. app.sides.client or app.sides.server).
 *
 * @module cater-build/webpack-generator
 */

// Webpack setting specifically for DEBUG situations. Local development
// server is the prime example.
function forDebug(result) {
  // Slower, but more accurate source maps for development
  result.devtool = 'eval-source-map';
  return result;
}

// When the webpack is running on the server side.
function forServer(result, side, app) {
  result.output.path = app.buildPath;
  result.output.libraryTarget = 'commonjs2';
  return result;
}

// For BUILD webpack builds.
function forBuild(result) {
  result.output.filename = '[name].[chunkhash].js';

  const uglify = new UglifyJsPlugin({
    compress: {
      warnings: false,
      screw_ie8: true,
      conditionals: true,
      unused: true,
      comparisons: true,
      sequences: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true
    },
    output: {
      comments: false
    }
  });

  result.plugins.push(uglify);
  result.plugins.push(new webpack.HashedModuleIdsPlugin());

  result.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  );

  result.plugins.push(
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
      threshold: 10240,
      minRatio: 0.8
    })
  );

  result.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

  // Chunk out the vendor pieces -- TODO: not implemented yet
  // result.plugins.push(
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: "vendor",
  //     filename: "vendor.[chunkhash].js",
  //     minChunks(module) {
  //       return module.context && module.context.indexOf("node_modules") >= 0;
  //     }
  //   })
  // );
}

// Configures Hot Module Replacement
function forHotModuleReplacement(result, side) {
  result.entry[side.bundleName] = [
    'react-hot-loader/patch',
    'webpack-hot-middleware/client?noInfo=false'
  ].concat(result.entry[side.bundleName]);

  result.plugins.push(new webpack.HotModuleReplacementPlugin());

  return result;
}

// Generate the Webpack configuration
function generate(app, side) {
  // Component parts of the Webpack configuration
  const entry = {};
  entry[side.bundleName] = [side.entryPath];

  const options = side.babel;
  const module = {
    rules: [
      {
        options,
        test: /\.js$/,
        loader: 'babel-loader',
        include: side.paths,
        exclude: /\/node_modules\/(?!(cater$|cater-))/ // TODO
      }
    ]
  };

  const plugins = [
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(), //
    new webpack.NoEmitOnErrorsPlugin(),
    new ManifestPlugin(),
    new webpack.DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV),
      MODE: JSON.stringify(process.env.CATER_MODE),
      SIDE: JSON.stringify(side.sideName)
    })
  ];

  const output = {
    chunkFilename: '[name].[chunkhash].js',
    path: app.buildPath,
    publicPath: app.publicPath
  };
  if (side.typeClient) output.path = path.join(app.buildPath, app.publicPath);

  const resolve = {
    plugins: [
      {
        // TODO: Not quite happy with how this turned out. We don't get to see
        // that the import in the (say) assets/blah.scss file is actually
        // 'assets/cat.png' rather than './assets/cat.png'. This covers the
        // case, but not very neatly to my liking.
        apply: (resolver) => {
          // Universal imports from the assets directory (say in SCSS files).
          // Get clobbered into relative paths. Which then become
          // <appRootPath>/assets/assets/cat.png rather than just assets. This
          // Hook fixes that issue then it comes around.
          resolver.plugin('file', (ctx, callback) => {
            if (!ctx.path.includes('/assets/assets/') || fs.existsSync(ctx.path)) return callback();
            ctx.path = ctx.path.replace('/assets/assets/', '/assets/');
            return callback(null, ctx);
          });
        }
      }
    ]
  };

  // Assemble the final pieces in a single Webpack configuration
  const config = {
    context: app.appRootPath,
    entry,
    module,
    plugins,
    output,
    resolve
  };

  // Post-process for various environments and specialized settings
  const forDebugOrBuild = app.mode === 'build' ? forBuild : forDebug;
  forDebugOrBuild(config, side, app);
  if (side.typeServer) forServer(config, side, app);

  if (app.hotModuleReplacement && side.typeClient) forHotModuleReplacement(config, side);

  return config;
}

module.exports = generate;
