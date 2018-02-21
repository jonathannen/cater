// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');
const ServerProvider = require('../server/server-provider');
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
 * @module cater-runtime/render-react
 */

function generateReactRenderer(serverContext, components) {
  const serverContextPrototype = Object.getPrototypeOf(serverContext);

  return function handle(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<!DOCTYPE html>');

    // Create a new Server Context
    const context = Object.assign(Object.create(serverContextPrototype), clone(serverContext));
    context.url = req.url;

    // Equivalent of:
    // <ServerProvider context={}><Provider><App/><Provider></CaterProvider>
    const app = createElement(components.App, null, null);
    const providerWrap = createElement(components.Provider, null, app);
    const caterWrap = createElement(ServerProvider, { context }, providerWrap);
    const providerAppBody = renderToString(caterWrap);

    context.bodyHTML = providerAppBody;

    // Equivalent of:
    // <CaterProvider context={}>
    // <Layout>{providerAppBody}</Layout>
    // </CaterProvider>
    const layout = createElement(components.Layout, { bodyHTML: providerAppBody }, null);
    const wrappedLayout = createElement(ServerProvider, { context }, layout);
    const reactBody = renderToStaticMarkup(wrappedLayout);

    res.write(reactBody);
    res.end();
  };
}

module.exports = generateReactRenderer;
