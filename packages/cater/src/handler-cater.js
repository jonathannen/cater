// Copyright Jon Williams 2017. See LICENSE file.
import CaterContext from "./cater-context";
import CaterProvider from "../server/cater-provider";
import React from "react";
import { renderToString } from "react-dom/server";

const CATER_MODULE_NAME_REGEX = /(\/client\/|\/server\/|\/app\/)/;

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

  const caterContext = new CaterContext();
  caterContext.bundlePath = bundlePath;
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
 * Unloads cater-based modules from the regular node require cache.
 */
const unloadCaterBasedModules = function() {
  const moduleNames = Object.keys(require.cache);
  const unloadList = moduleNames.filter(v => v.match(CATER_MODULE_NAME_REGEX));
  unloadList.forEach(v => delete require.cache[v]);
  return true;
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

  // Callback that gets this handler to unload cater-based modules and
  // reload from teh server entry point.
  handler.reload = function(firstRun = false) {
    unloadCaterBasedModules();
    try {
      const components = require(entryPath)();
      Object.assign(handler, components);
      return true;
    } catch (e) {
      if (firstRun) throw e;
      console.error(e);
      return false;
    }
  };
  handler.reload(true);

  return handler;
};

export default generate;
