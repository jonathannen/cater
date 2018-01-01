// Copyright Jon Williams 2017-2018. See LICENSE file.
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const CompressionPlugin = require('compression-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

/**
 * Generates a Webpack configuration object for the given context and
 * context side (i.e. context.sides.client or context.sides.server).
 */
const generate = function(context, side) {
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
        exclude: /\/node_modules\/(?!(cater$|cater-))/
      }
    ]
  };

  const plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(), //
    new webpack.NoEmitOnErrorsPlugin(),
    new ManifestPlugin()
  ];

  const output = {
    chunkFilename: '[name].[chunkhash].js',
    path: context.buildPath,
    publicPath: context.publicPath
  };
  if (side.typeClient) output.path = path.join(context.buildPath, context.publicPath);

  // Assemble the final pieces in a single Webpack configuration
  const config = {
    context: context.appRootPath,
    entry,
    module,
    plugins,
    output
  };

  // Post-process for various environments
  const forDebugOrBuild = context.debug ? forDebug : forBuild;
  forDebugOrBuild(config, side, context);
  if (side.typeServer) forServer(config, side, context);

  return config;
};

// Webpack setting specifically for DEBUG situations. Local development
// server is the prime example.
const forDebug = function(result, side, context) {
  // Slower, but more accurate source maps for development
  result.devtool = 'eval-source-map';

  result.plugins.push(new webpack.NamedModulesPlugin());
  return result;
};

// When the webpack is running on the server side.
const forServer = function(result, side, context) {
  result.output.path = context.buildPath;
  result.output.libraryTarget = 'commonjs2';
  return result;
};

// For BUILD webpack builds.
const forBuild = function(result, side, context) {
  result.output.filename = '[name].[chunkhash].js';

  const uglify = new webpack.optimize.UglifyJsPlugin({
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
};

module.exports = generate;
