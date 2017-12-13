// Copyright Jon Williams 2017. See LICENSE file.
import generator from './webpack-generator';
import MemoryFileSystem from 'memory-fs';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

const DEFAULT_WEBPACK_WATCH_OPTIONS = {
    noInfo: true, hot: false, inline: true, stats: { colors: true, },
}

/**
 * Utility hook that generate a Promise from events from a webpack compiler.
 * @param {String} name identifies the compiler. Usually "client" or "server".
 * @param {Compiler} compiler the webpack compiler object.
 * @param {Function} next an optional callback.
 */
const webpackPromise = function (name, compiler, next = null) {
    const promise = new Promise((resolve, reject) => {
        compiler.plugin('done', (stats) => {
            console.log(`Webpack ${name}-side compilation complete.`);
            if (next !== null) next();
            let isError = stats.compilation.errors.length > 0;
            return isError ? reject(stats.compilation.errors) : resolve(compiler);
        });
    });
    return promise;
}

/**
 * Returns a Promise that'll complete based upon the initial webpack
 * compilation. In the resolved case it'll provide the http.Handler for
 * the webpack client side development server.
 */
const generateHandler = function (context, reloadCallback = null) {
    const clientCompiler = webpack(generator(context, context.client));
    const serverCompiler = webpack(generator(context, context.server));;

    const watchOptions = Object.assign({}, DEFAULT_WEBPACK_WATCH_OPTIONS);
    watchOptions.publicPath = context.server.publicPath;

    // Stops the server side Webpack compiler emiting to the file system.
    // The client side compiler has the same hack in webpack-dev-middleware.
    serverCompiler.outputFileSystem = new MemoryFileSystem();
    let serverWatchStarted = false;

    // Start the client-side Webpack. If this completes successfully, start
    // the server-side Webpack watch.
    const client = webpackPromise('client', clientCompiler, () => {
        const callback = (err, stats) => {
            if (err) console.log(err); // Need something better here
        }
        if (!serverWatchStarted) {
            serverCompiler.watch(watchOptions, callback);
            serverWatchStarted = true;
        }
    });

    // One each server compilation, reimport the server entry point. This
    //mwill also send the reload trigger.
    const server = webpackPromise('server', serverCompiler, reloadCallback);

    // Good to go. Start the server.
    const middleware = webpackDevMiddleware(clientCompiler, watchOptions);

    // Returned promise waits for both the client and server compilations
    // to complete. The promise will return the handler to the webpack
    // development server.
    return Promise.all([client, server])
        .then (() => { return middleware })
        .catch((err) => {
            console.log(err);
            process.exit(-1);
        })
}

export default generateHandler;