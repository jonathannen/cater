// Copyright Jon Williams 2017-2018. See LICENSE file.
const CaterContext = require('./cater-context');
const CaterProvider = require('../server/cater-provider');
const { createElement } = require('react');
const { renderToNodeStream } = require('react-dom/server');

/**
 * # Fast Render
 *
 * A http.Handler that renders the App using the "fast" methods. This cuts some
 * corners that puts limitations on what is the <head> of the document. In
 * return you get a faster time-to-first-byte (TTFB) *and* quicker output
 * of key assets like the bundle.
 *
 * Besides the lack of flexibility with the <head>, this method always
 * returns a 200 OK. Even if the App render fails. That shouldn't really
 * happen, but it would be preferable to have the option.
 *
 * This isn't the default renderer at the moment. The react renderer works fine
 * (in fact it's faster in many microbenchmarks). We need more realistic app
 * benchmarks to determine how to optimize this path.
 *
 * To enable, set the Cater option "renderer" to fast.
 *
 * @module cater-runtime/render-fast
 */

function handleData(req, res, json) {
  json.forEach(([name, data]) => {
    const escaped = encodeURIComponent(JSON.stringify(data));
    res.write(`<script>window.${name} = JSON.parse(decodeURIComponent("${escaped}"));</script>`);
  });
}

function handleTitle(req, res, title) {
  const escaped = encodeURIComponent(title);
  res.write(`<script>document.title = decodeURIComponent("${escaped}");</script>`);
}

function generateFastRenderer(bundlePath, components) {
  // Memoize things that won't change
  const start = '<!DOCTYPE html><html><head><meta charSet="utf-8"/><title></title></head><body>';
  const end = `<script async="" src="${bundlePath}"></script></body></html>`;

  // <link rel="preload" href="${bundlePath}" as="script">
  const headers = {
    'Content-Type': 'text/html', //
    Link: `<${bundlePath}>; rel=preload; as=script`
  };

  return function handle(req, res) {
    res.writeHead(200, headers);
    res.write(start);

    // Equivalent of:
    // <CaterProvider caterContext={}><Provider><App/><Provider></CaterProvider>
    const caterContext = new CaterContext(bundlePath, req.url);
    const app = createElement(components.App, null, null);
    const divWrap = createElement('div', { id: 'root' }, app);
    const providerWrap = createElement(components.Provider, null, divWrap);
    const caterWrap = createElement(CaterProvider, { caterContext }, providerWrap);

    // Stream the application directly to the response
    const stream = renderToNodeStream(caterWrap);
    stream.pipe(res, { end: false });
    stream.on('end', () => {
      const json = Object.entries(caterContext.globalJSON);
      if (json.length > 0) handleData(req, res, json);
      if (caterContext.title) handleTitle(req, res, caterContext.title);

      res.write(end);
      res.end();
    });
  };
}

module.exports = generateFastRenderer;
