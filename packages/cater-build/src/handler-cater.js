// Copyright Jon Williams 2017-2018. See LICENSE file.
const debounce = require('./util-debounce');
const fs = require('fs');
const { HandlerCater } = require('cater-runtime');

/**
 * # Handler Cater (Build)
 *
 * A http.Handler that wrappers the runtime version. At build time, we also
 * want to reload code and assets when it changes. This is done through two
 * mechanisms:
 *
 * - A reload hook that is triggered when the Webpack client-side code completes.
 * - A separate hook that detects changes in any server-specific files.
 *
 * This module handles reloading of all of the Cater-based modules on the
 * server-side. However, it only watches the server-specific files. This is
 * to keep it simple with the overlap with webpack, which is watching
 * the remainder of the code.
 *
 * The reload is debounced to prevent a reload cascade server-side. The result
 * of the handler.reload function is a promise the resolves/rejects on the
 * outcome of the server side load.
 *
 * @module cater-build/handler-cater
 */

// Validates that any server load/reload has got React components. The load
// process brings in the `server/_entry.js` file, which should return valid
// App, Layout and Provider components.
function checkServerComponents(handler) {
  ['App', 'Layout', 'Provider'].forEach((v) => {
    if (!handler[v] || typeof handler[v] !== 'function') {
      throw new Error(
        `Didn't find the ${v} component. Make sure you have a React component in app/${v.toLowerCase()}.js.`
      );
    }
  });
}

// Creates a build-time handler using the configuration from the provided
// Cater application.
function generate(app) {
  // Get an instance of the cater-runtime handler
  const { renderer, publicPath, assetHost } = app;
  const { server } = app.sides;
  const handler = HandlerCater(
    renderer,
    server.entryPath,
    publicPath,
    assetHost,
    app.defaultContext
  );

  // Wrapped version of the handler that filters out Hot Module Replacement
  // queries.
  function wrappedHandler(req, res, next = null) {
    if (req.url === '/__webpack_hmr') return next ? next() : null;
    return handler(req, res, next);
  }

  function filterCaterModule(file) {
    return app.getAllPaths().find((p) => file.startsWith(p));
  }
  function filterServerModule(file) {
    return server.sidePaths.find((p) => file.startsWith(p));
  }
  function listModules(filterFunction) {
    return Object.keys(require.cache).filter((v) => filterFunction(v));
  }

  // Unloads all cater based modules from (this) the node-side
  function unloadCaterModules() {
    listModules(filterCaterModule).forEach((v) => delete require.cache[v]);
  }

  // Sets up file change watches on cater modules that have been tagged as
  // server-side. If a chance occurs, the callback is called. This works off
  // both the list of imports from the server-side and the tagged module list
  let watches = []; // Will be list of stat objects, plus a watch added
  function watchCaterServerModules(debouncedReloadCallback, providedCandidateList = []) {
    const serverModules = listModules(filterServerModule);
    const filteredCandidates = providedCandidateList.filter((v) => filterServerModule(v));
    const uniqueCombinedList = [...new Set([...serverModules, ...filteredCandidates])];

    // Clean up the old file watched and create a new set
    watches.forEach((w) => w.watch.close());
    watches = uniqueCombinedList.map((filename) => {
      const result = fs.statSync(filename);
      result.watch = fs.watch(filename, () => {
        // Often a change trigger will be fired multiple times when nothing
        // has changed. This prevents some of these. The debounce does the rest.
        const mtime = fs.statSync(filename).mtime.getTime();
        if (result.mtime.getTime() === mtime) return;
        debouncedReloadCallback();
      });
      return result;
    });
  }

  // Callback that gets this handler to unload cater-based modules and
  // reload from the server entry point.
  function reload() {
    try {
      const isError = app.triggerRetry('server');

      // Happy path of loading the server-side components.
      unloadCaterModules();
      handler.load(); // Will import server/_entry.js
      checkServerComponents(handler);
      watchCaterServerModules(wrappedHandler.reload);

      const isResolved = app.triggerResolution('server');
      if (isError && isResolved) console.log('All errors resolved'); // eslint-disable-line no-console

      server.requiredFileList = [];

      return false;
    } catch (e) {
      // Error occured.
      app.triggerError('server', e);
      watchCaterServerModules(wrappedHandler.reload, server.requiredFileList);
      throw e;
    }
  }

  // Reloading is debounced on a 500ms interval. This debounce returns
  // a promose on the server load result.
  wrappedHandler.reload = debounce(reload, 500);
  wrappedHandler.load = handler.load;

  return wrappedHandler;
}

module.exports = generate;
