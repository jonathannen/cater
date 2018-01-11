// Copyright Jon Williams 2017-2018. See LICENSE file.
const CaterContext = require('./cater-context');
const CaterProvider = require('../server/cater-provider');
const { createElement } = require('react');
const { renderToStaticMarkup, renderToString } = require('react-dom/server');

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
 *
 * This is currently the default renderer.
 *
 * @module cater-runtime/render-fast
 */

function generateReactRenderer(bundlePath, components) {
  return function handle(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<!DOCTYPE html>');

    const caterContext = new CaterContext(bundlePath, req.url);

    // Equivalent of:
    // <CaterProvider caterContext={}><Provider><App/><Provider></CaterProvider>
    const app = createElement(components.App, null, null);
    const providerWrap = createElement(components.Provider, null, app);
    const caterWrap = createElement(CaterProvider, { caterContext }, providerWrap);
    const providerAppBody = renderToString(caterWrap);

    // Equivalent of:
    // <CaterProvider caterContext={}>
    // <Layout><div id='root'>{providerAppBody}</div></Layout>
    // </CaterProvider>
    const rootDiv = createElement(
      'div',
      { id: 'root', dangerouslySetInnerHTML: { __html: providerAppBody } },
      null
    );
    const layout = createElement(components.Layout, null, rootDiv);
    const wrappedLayout = createElement(CaterProvider, { caterContext }, layout);
    const reactBody = renderToStaticMarkup(wrappedLayout);

    res.write(reactBody);
    res.end();
  };
}

module.exports = generateReactRenderer;
