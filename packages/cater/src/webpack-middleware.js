// Copyright Jon Williams 2017. See LICENSE file.
import generator from './webpack-generator';
import MemoryFileSystem from 'memory-fs';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

const DEFAULT_WEBPACK_WATCH_OPTIONS = {
    inline: true,
    logLevel: 'warn',
    stats: { colors: true, },
}

/**
 * Returns a Promise that'll complete based upon the initial webpack
 * compilation. In the resolved case it'll provide the http.Handler for
 * the webpack client side development server.
 */
const generateHandler = function (context, reloadCallback = null) {
    const clientConfig = generator(context, context.sides.client);
    const serverConfig = generator(context, context.sides.server);

    const compiler = webpack([clientConfig, serverConfig]);

    const client = new Promise((resolve, reject) => {
        compiler.plugin('done', (result) => {
            console.log(`Webpack compilation complete.`);
            const errors = result.stats.reduce((result, stat) => {
                return result.concat(stat.compilation.errors);
            }, []);

            const isError = errors.length > 0;
            if(isError) return reject(errors);

            if(reloadCallback !== null) reloadCallback();            
            resolve(compiler);
        });
    });

    // Good to go. Start the server.
    const watchOptions = Object.assign({}, DEFAULT_WEBPACK_WATCH_OPTIONS);
    watchOptions.publicPath = context.sides.server.publicPath;
    const middleware = webpackDevMiddleware(compiler, watchOptions);

    // Returned promise waits for both the client and server compilations
    // to complete. The promise will return the handler to the webpack
    // development server.
    return client
        .then (() => { return middleware })
        .catch((err) => {
            console.error(err);
            process.exit(-1);
        })
}

export default generateHandler;