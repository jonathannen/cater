// Copyright Jon Williams 2017. See LICENSE file.
const CaterContext  = require('./cater-context');
const CaterProvider = require('../server/cater-provider');
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');

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
const reactHandler = function(req, res, bundlePath, App, Layout, Provider) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<!DOCTYPE html>");

  const caterContext = new CaterContext(bundlePath);

  // Equivalent of:
  // <CaterProvider caterContext={}><Provider><App/><Provider></CaterProvider>
  const app = createElement(App, null, null);
  const caterWrap = createElement(CaterProvider, {caterContext: caterContext}, app);
  const providerWrap = createElement(Provider, null, caterWrap);
  const appBody = renderToString(providerWrap);

  // Equivalent of:
  // <CaterProvider caterContext={}>
  // <Layout><div id="__CATER_ROOT">{app}</div></Layout>
  // </CaterProvider>
  const rootDiv = createElement('div', { id: '__CATER_ROOT', dangerouslySetInnerHTML: { __html: appBody }}, null);
  const layout = createElement(Layout, null, rootDiv);
  const wrappedLayout = createElement(CaterProvider, {caterContext: caterContext}, layout);
  const reactBody = renderToString(wrappedLayout);

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
      reactHandler(req, res, bundlePath, handler.App, handler.Layout, handler.Provider);
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
