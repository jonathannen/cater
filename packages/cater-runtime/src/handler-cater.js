// Copyright Jon Williams 2017-2018. See LICENSE file.
const Render = require('./render-react');

/**
 * Creates a handler with the given entry point (file that loads server
 * components).
 */
function generate(entryPath, publicPath, assetHost, serverContext) {
  let render = null;

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

  // Currently only supporting the react renderer - potentially will have a
  // fast-pathing version available once the API/codebase is stable.
  render = Render(serverContext, handler);

  return handler;
}

module.exports = generate;
