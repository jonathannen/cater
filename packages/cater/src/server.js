// Copyright Jon Williams 2017. See LICENSE file.
import prettyBytes from 'pretty-bytes';
import http, { STATUS_CODES } from 'http'
import MemoryFileSystem from 'memory-fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import webpack from 'webpack';

const DEFAULT_WEBPACK_WATCH_OPTIONS = {
    noInfo: true, hot: false, inline: true, stats: { colors: true, },
}

const statusCodeAsTerminalColor = function (status) {
    // Referenced from https://github.com/expressjs/morgan/blob/master/index.js#L189
    var color = status >= 500 ? 31 // red
        : status >= 400 ? 33 // yellow
            : status >= 300 ? 36 // cyan
                : status >= 200 ? 32 // green
                    : 0 // no color
    return color;
}

/**
 * Basic middleware that outputs to the console. Output looks like:
 *      GET /path 200 OK 1.209 ms 343 [343 B]
 * 
 * Where the order of values is the HTTP Method, Path, Status Code,
 * Status Description, Render Time (server), Byte Size and [Byte Size Human
 * Readable].
 */
const loggingMiddleware = function (req, res, next) {
    const start = process.hrtime();
    const conn = req.connection;
    const bytesWritten = (conn._bytesWritten === undefined) ? 0 : conn._bytesWritten;

    res.on('finish', () => {
        const bytes = conn.bytesWritten - bytesWritten;
        conn._bytesWritten = conn.bytesWritten;

        const elapsed = process.hrtime(start);
        const elapsedMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000);
        const color = statusCodeAsTerminalColor(res.statusCode);

        console.log(`\x1b[0m${req.method} ${req.url} \x1b[${color}m${res.statusCode} ${res.statusMessage}\x1b[0m ${elapsedMs.toLocaleString()} ms ${bytes} [${prettyBytes(bytes)}]`)
    })
    return next();
}

/**
 * Class that encapsulates the development server for Cater.
 */
export class CaterServer {

    constructor(bundlePath, serverEntryPath) {
        this.bundlePath = bundlePath;
        this.serverEntryPath = serverEntryPath;

        this.webpackMiddleware = null;

        // Yes, two webpack compilers. The options are different depending
        // on the client or server "side" we're operating under.
        this.webpackCompilerClient = null;
        this.webpackCompilerServer = null;
        this.webpackWatchOptions = Object.assign({}, DEFAULT_WEBPACK_WATCH_OPTIONS);
    }

    /**
     * A standalone request handler function that is bound to this server.
     * Can be used directly in servers.
     */
    boundRequestHandler() {
        return this.middlewareHandler.bind(this);
    }
    
    /**
     * Creates two Webpack-compilation promises and returns in Promise.all.
     * Each for generating client and server-side code. The client compiler
     * is watching for changes via the Webpack Dev Middleware. If it is
     * detected, the server side is run too.
     * 
     * The are two Webpack configurations as we want the code to be as 
     * closely "universal" as possible, but there are differences.
     */
    configureWebpackDevServer() {
        // Only require if we're using the module
        const webpackDevMiddleware = require('webpack-dev-middleware');
        this.webpackWatchOptions.publicPath = this.webpackCompilerClient.options.output.publicPath;
        let serverWatchStarted = false;

        // Stops the server side Webpack compiler emiting to the file system.
        // The client side compiler has the same hack in 
        // webpack-dev-middleware.
        this.webpackCompilerServer.outputFileSystem = new MemoryFileSystem();
        
        // Promise that is triggered by a "done" compilation event from
        // a Webpack Compiler. Also runs an optional callback.
        const webpackPromise = function (name, compiler, fn = null) {
            const promise = new Promise((resolve, reject) => {
                compiler.plugin('done', (stats) => {
                    console.log(`Webpack ${name}-side compilation complete.`);
                    if (fn !== null) fn();
                    let isError = stats.compilation.errors.length > 0;
                    return isError ? reject(stats.compilation.errors) : resolve(compiler);
                });
            });
            return promise;
        }

        // Start the client-side Webpack. If this completes successfully, start
        // the server-side Webpack watch.
        const client = webpackPromise('client', this.webpackCompilerClient, () => {
            const callback = (err, stats) => {
                if(err) console.log(err); // Need something better here
            }
            if(!serverWatchStarted) {
                this.webpackCompilerServer.watch(this.webpackWatchOptions, callback);
                serverWatchStarted = true;
            }
        });

        // One each server compilation, reimport the server entry point. This
        // reloads the key App and Layout components.
        const server = webpackPromise('server', this.webpackCompilerServer, () => {
            var v = require(this.serverEntryPath)();
            Object.assign(this, v);
        });

        // Set up the middleware, which triggers client compilation/watch.
        this.webpackMiddleware = webpackDevMiddleware(this.webpackCompilerClient, this.webpackWatchOptions);

        // Returned promise waits for both the client and server compilations
        // to complete.
        return Promise.all([client, server]);
    }

    /**
     * Simple HTTP handler that chains together other middleware-style
     * handlers.
     */
    middlewareHandler(req, res) {
        const handlers = [loggingMiddleware, this.webpackMiddleware, this.reactHandler]
        const next = () => {
            var handler = handlers.shift();
            if (handler === undefined) return true;
            handler.bind(this)(req, res, next);
        }
        return next();
    }

    /**
     * Simple HTTP handler that renders the App via React.
     */
    reactHandler(req, res, next) {
        const App = this.App;
        const Layout = this.Layout;        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<!DOCTYPE html>\n')
        const reactBody = renderToString(<Layout app={App} bundlePath={this.bundlePath}/>);
        res.write(reactBody);
        res.end();
    }

}

/**
 * Returns a promise that resolves into a HTTP Handler.
 */
const prepareHandler = function (context) {
    var side = context.server;

    const bundlePath = context.bundlePath();
    const serverEntryPath = context.server.resolve(context.options.entryScriptName);

    const cs = new CaterServer(bundlePath, serverEntryPath);
    const result = cs.boundRequestHandler();
    
    // If debug mode is turned on, use the Webpack compilers to create
    // the client and server side code.
    var promise;
    if (side.debug) {
        const generator = require('./webpack-generator');
        cs.webpackCompilerClient = webpack(generator(context, context.client));
        cs.webpackCompilerServer = webpack(generator(context, context.server));;
        promise = cs.configureWebpackDevServer().then(() => {
            return result;
        })
    }
    else {
        promise = Promise.resolve(result);
    }

    return promise;
}

export default prepareHandler;