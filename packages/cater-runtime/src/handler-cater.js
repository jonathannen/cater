// Copyright Jon Williams 2017. See LICENSE file.
import CaterContext from "./cater-context";
import CaterProvider from "../server/cater-provider";
import React from "react";
import { renderToString } from "react-dom/server";

/**
 * http.Handler that renders the App via React.
 *
 * This method works in two passes. First the App component itself is rendered.
 * This allows App components to manipulate the CaterContext that is passed
 * in as a provider.
 *
 * A second pass used the Layout component to render all the HTML. This can
 * use the same CaterContext. In this way, App components can set higher-level
 * options such as <head> elements.
 */
const reactHandler = function(req, res, bundlePath, App, Layout) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<!DOCTYPE html>");

  const caterContext = new CaterContext(bundlePath);
  const appBody = renderToString(
    <CaterProvider caterContext={caterContext}>
      <App />
    </CaterProvider>
  );

  const reactBody = renderToString(
    <CaterProvider caterContext={caterContext}>
      <Layout>
        <div id="__CATER_ROOT" dangerouslySetInnerHTML={{ __html: appBody }} />
      </Layout>
    </CaterProvider>
  );

  res.write(reactBody);
  res.end();
};

/**
 * Creates a handler with the given entry point (file that loads server
 * components). Plus the bundlePath.
 */
const generate = function(entryPath, bundlePath, publicPath) {

  const handler = function(req, res, next = null) {
    if (!req.url.startsWith(publicPath)) {
      reactHandler(req, res, bundlePath, handler.App, handler.Layout);
    } else if (next !== null) {
      next();
    }
    return;
  };

  // Get the Layout and App components from the server bundle. Provided
  // as a hook on the handler to use in dev reload scenarios.
  handler.load = function() {
    const components = require(entryPath)();
    Object.assign(handler, components);
  }
  handler.load();

  return handler;
};

module.exports = generate;
