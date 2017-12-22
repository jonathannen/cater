// Copyright Jon Williams 2017. See LICENSE file.
import "babel-polyfill"; // Enables async/await
import caterMiddleware from "./cater-middleware";
import cater from "../index.js";
import { middlewareHandler } from "./middleware";

const errorHandler = function(req, res, handlers) {
  throw "Request not handled.";
};

export const testCater = function(options = {}) {
  const app = cater(options);
  return app;
};

/**
 * Returns a http.Handler that can be used in tests.
 */
export const testHandler = function(appRootPath = null) {
  const cater = testCater({ appRootPath: appRootPath || process.cwd() });
  const config = cater.sides.server;

  const caterHandler = caterMiddleware(
    config.entryPath,
    config.bundlePath,
    cater.publicPath
  );

  const handlers = [caterHandler, errorHandler];
  const handler = function(req, res, next = null) {
    middlewareHandler(req, res, handlers);
    if (next !== null) next();
  };
  return handler;
};
