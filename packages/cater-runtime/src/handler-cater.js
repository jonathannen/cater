// Copyright Jon Williams 2017-2018. See LICENSE file.
const CaterContext = require('./cater-context');
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
function reactHandler(req, res, bundlePath, App, Layout, Provider) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<!DOCTYPE html>');

  const caterContext = new CaterContext(bundlePath, req.url);

  // Equivalent of:
  // <CaterProvider caterContext={}><Provider><App/><Provider></CaterProvider>
  const app = createElement(App, null, null);
  const providerWrap = createElement(Provider, null, app);
  const caterWrap = createElement(CaterProvider, { caterContext }, providerWrap);
  const appBody = renderToString(caterWrap);

  // Equivalent of:
  // <CaterProvider caterContext={}>
  // <Layout><div id="__CATER_ROOT">{app}</div></Layout>
  // </CaterProvider>
  const rootDiv = createElement(
    'div',
    { id: '__CATER_ROOT', dangerouslySetInnerHTML: { __html: appBody } },
    null
  );
  const layout = createElement(Layout, null, rootDiv);
  const wrappedLayout = createElement(CaterProvider, { caterContext }, layout);
  const reactBody = renderToString(wrappedLayout);

  res.write(reactBody);
  res.end();
}

/**
 * Creates a handler with the given entry point (file that loads server
 * components). Plus the bundlePath.
 */
function generate(entryPath, bundlePath, publicPath, assetHost) {
  // Is a CDN in use?
  const finalBundlePath = `${assetHost || ''}${bundlePath}`;

  const handler = function handler(req, res, next = null) {
    if (!req.url.startsWith(publicPath)) {
      reactHandler(req, res, finalBundlePath, handler.App, handler.Layout, handler.Provider);
    } else if (next !== null) {
      next();
    }
    return true;
  };

  // Get the Layout and App components from the server bundle. Provided
  // as a hook on the handler to use in dev reload scenarios.
  handler.load = function load() {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const components = require(entryPath)();
    Object.assign(handler, components);
  };
  handler.load();

  return handler;
}

module.exports = generate;
