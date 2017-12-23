// Copyright Jon Williams 2017. See LICENSE file.
import React from "react";
import { renderToString } from "react-dom/server";

const CATER_MODULE_NAME_REGEX = /(\/client\/|\/server\/|\/app\/)/;

/**
 * Simple HTTP handler that renders the App via React.
 */
const reactHandler = function(req, res, bundlePath, App, Layout) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<!DOCTYPE html>");
  const reactBody = renderToString(<Layout app={App} bundlePath={bundlePath} />);
  res.write(reactBody);
  res.end();
};

/**
 * Unloads cater-based modules from the regular node require cache.
 */
const unloadCaterBasedModules = function() {
  const moduleNames = Object.keys(require.cache);
  const unloadList = moduleNames.filter(v => v.match(CATER_MODULE_NAME_REGEX));
  unloadList.forEach((v) => delete require.cache[v]);
  return true;
}

/**
 * Creates a handler with the given entry point (file that loads server
 * components). Plus the bundlePath.
 */
const generateHandler = function(entryPath, bundlePath, publicPath) {
  const handler = function(req, res, next = null) {
    if (!req.url.startsWith(publicPath)) {
      reactHandler(req, res, bundlePath, handler.App, handler.Layout);
    } else if (next !== null) {
      next();
    }
    return;
  };

  // Callback that gets this handler to unload cater-based modules and
  // reload from teh server entry point.
  handler.reload = function(firstRun = false) {
    unloadCaterBasedModules();
    try {
      const components = require(entryPath)();
      Object.assign(handler, components);
      return true;
    } catch(e) {
      if(firstRun) throw e;
      console.error(e);
      return false;
    }
  };
  handler.reload(true);

  return handler;
};

export default generateHandler;
