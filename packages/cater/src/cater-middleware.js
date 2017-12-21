// Copyright Jon Williams 2017. See LICENSE file.
import React from "react";
import { renderToString } from "react-dom/server";

/**
 * Simple HTTP handler that renders the App via React.
 */
const reactHandler = function(req, res, bundlePath, App, Layout) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<!DOCTYPE html>\n");
  const reactBody = renderToString(
    <Layout app={App} bundlePath={bundlePath} />
  );
  res.write(reactBody);
  res.end();
};

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

  handler.reload = function() {
    const components = require(entryPath)();
    Object.assign(handler, components);
    return handler.reload;
  };
  handler.reload();

  return handler;
};

export default generateHandler;
