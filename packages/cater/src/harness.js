// Copyright Jon Williams 2017. See LICENSE file.
import "babel-polyfill"; // Enables async/await
import caterMiddleware from './cater-middleware';
import Context from './context';
import { middlewareHandler } from './middleware';

const errorHandler = function(req, res, handlers) {
    throw "Request not handled."
}

export const testContext = function(options) {
  return new Context(options);
}

/**
 * Returns a http.Handler that can be used in tests.
 */
export const testHandler = function(appRootPath = null) {
    const context = testContext({ appRootPath: (appRootPath || process.cwd())});
    const config = context.sides.server;

    const caterHandler = caterMiddleware(config.entryPath, config.bundlePath, context.publicPath);

    const handlers = [caterHandler, errorHandler];
    const handler = function(req, res, next = null) {
        middlewareHandler(req, res, handlers);
        if(next !== null) next();
    }
    return handler;
}
