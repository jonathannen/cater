// Copyright Jon Williams 2017. See LICENSE file.
import "babel-polyfill"; // Enables async/await
import caterMiddleware from './cater-middleware';
import { middlewareHandler } from './middleware';

const errorHandler = function(req, res, handlers) {
    throw "Request not handled."
}

export const testContext = function(appRootPath = null) {
    const createContext = require('./context');
    return createContext(appRootPath);
}

/**
 * Returns a http.Handler that can be used in tests.
 */
export const testHandler = function(appRootPath = null) {
    const context = testContext(appRootPath);
    const config = context.sides.server;

    const caterHandler = caterMiddleware(config.entryPath, config.bundlePath, context.options.publicPath);

    const handlers = [caterHandler, errorHandler];
    const handler = function(req, res, next = null) {
        middlewareHandler(req, res, handlers);
        if(next !== null) next();
    }
    return handler;
}
