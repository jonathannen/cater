// Copyright Jon Williams 2017. See LICENSE file.
import handlerCater from "./handler-cater";
import cater from "../index.js";
import { middlewareHandler } from "./middleware";

if (!global.__POLYFILL__) {
  global.__POLYFILL__ = !!require("babel-polyfill");
}

export const testCater = function(options = {}) {
  const app = cater(options);
  return app;
};

/**
 * Returns a http.Handler that can be used in tests.
 */
export const testHandler = function(appRootPath = null) {
  const cater = testCater({ appRootPath: appRootPath || process.cwd() });
  const server = cater.sides.server;

  const _cater = handlerCater(server.entryPath, server.bundlePath, cater.publicPath);
  const errorHandler = (req, res, handlers) => {
    throw "Request not handled.";
  };

  return middlewareHandler([_cater, errorHandler]);
};