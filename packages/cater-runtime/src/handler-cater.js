// Copyright Jon Williams 2017-2018. See LICENSE file.

/**
 * Creates a handler with the given entry point (file that loads server
 * components).
 */
function generate(renderer, entryPath, bundlePath, publicPath, assetHost) {
  let render = null;

  // Is a CDN in use?
  const finalBundlePath = `${assetHost || ''}${bundlePath}`;

  const handler = function handler(req, res, next = null) {
    if (!req.url.startsWith(publicPath)) return render(req, res);
    return next !== null ? next() : false;
  };

  // Get the Layout and App components from the server bundle. Provided
  // as a hook on the handler to use in dev reload scenarios.
  handler.load = function load() {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const components = require(entryPath)();
    Object.assign(handler, components);
  };

  // Determine which Render we're using - either React or Fast
  // eslint-disable-next-line global-require
  const Render = renderer === 'fast' ? require('./render-fast') : require('./render-react');
  render = Render(finalBundlePath, handler);

  return handler;
}

module.exports = generate;
