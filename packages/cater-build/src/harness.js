// Copyright Jon Williams 2017-2018. See LICENSE file.
// Note ES2015 imports:
import handlerCater from "./handler-cater";
import cater from "../index.js";
import { Middleware } from "cater-runtime";

if (!global.INTERNAL_POLYFILL) {
  global.INTERNAL_POLYFILL = !!require("babel-polyfill"); // eslint-disable-line global-require
}

export function testCater(options = {}) {
  const app = cater(options);
  return app;
}

/**
 * Returns a http.Handler that can be used in tests.
 */
export function testHandler(appRootPath = null) {
  const app = testCater({ appRootPath: appRootPath || process.cwd() });
  const { server } = app.sides;

  const handler = handlerCater(app);
  const errorHandler = () => {
    throw new Error("Request not handled.");
  };

  return Middleware([handler, errorHandler]);
}
