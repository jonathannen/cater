// Copyright Jon Williams 2017. See LICENSE file.
import webpack from 'webpack';

const serverSideHotReloader = require.resolve('./server-side-hot-loader');

/**
 * Generates a Webpack configuration object for the given context and 
 * context side (i.e. context.client or context.server).
 */
const generate = function (context, side) {
    const entryPath = side.resolve(context.options.entryScriptName);
    const includePaths = side.modulePaths;

    // Component parts of the Webpack configuration
    const entry = { app: [
        'babel-polyfill/dist/polyfill.js',
        entryPath,
    ]};

    const query = side.babelOptions;
    const module = {
        loaders: [{
                query,
                test: /\.js$/,
                loader: 'babel-loader',
                include: includePaths,
        }],
    }

    const plugins = [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ];

    const output = {
        chunkFilename: '[name]_[chunkhash].js',
        filename: context.options.bundleFilename,
        path: side.buildPath,
        publicPath: context.options.bundlePublicPath,
    };

    // Assemble the final pieces in a single Webpack configuration
    const config = {
        context: context.appRootPath,
        entry, module, plugins, output,
    };

    // Post-process for various environments
    if(side.debug) forDebug(config, side, context);
    if(side.isServer) forServer(config, side, context);
    
    return config;
}

const forDebug = function (result, side, context) {
    // Slower, but more accurate source maps for development
    result.devtool = 'eval-source-map';
    return result;
}

const forServer = function (result, side, context) {
    result.output.libraryTarget = 'commonjs2';
    result.module.loaders.unshift({
        test: /\.js$/,
        loader: serverSideHotReloader,
        exclude: /\/node_modules\//,
    });
    return result;
}
    
export default generate;