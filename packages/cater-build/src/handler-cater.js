// Copyright Jon Williams 2017-2018. See LICENSE file.
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
 * @module cater-build/handler-cater
 */

// Creates a build-time handler using the configuration from the provided
// Cater application.
function generate(app) {
  // Get an instance of the cater-runtime handler
  const { renderer, publicPath, assetHost } = app;
  const handler = HandlerCater(
    renderer,
    app.sides.server.entryPath,
    app.sides.client.bundlePath,
    publicPath,
    assetHost
  );

  // Searches through the current server-side modules and tags them with
  // metadata according to their use in Cater. Ends up with something like:
  // [ 'universal', [...paths]], [ 'server': [...paths]], [ 'client'. [...paths]]
  const sidePathMapping = Object.values(app.sides)
    .map((s) => [s.name, s.sidePaths])
    .concat([['universal', app.universalPaths]]);

  function tagCaterModules() {
    Object.entries(require.cache).forEach(([name, mod]) => {
      const match = sidePathMapping.find(([, paths]) => paths.find((p) => name.startsWith(p)));
      if (!match) return;
      const stat = fs.statSync(name);
      // eslint-disable-next-line no-param-reassign
      mod.cater = { side: match[0], stat, mtime: stat.mtime.getTime() };
    });
  }

  // Unloads all tagged cater modules from the cache
  function unloadCaterModules() {
    Object.entries(require.cache).forEach(([key, mod]) => {
      if (!mod.cater) return;
      if (mod.cater.watcher) mod.cater.watcher.close(); // Turn off any stray file watches
      delete require.cache[key];
    });
  }

  // Server-side trigger of module reloading
  function reloadCaterServerModules() {
    handler.reload();
    console.log('Reloaded Server-Side modules.'); // eslint-disable-line no-console
    return true;
  }

  // Debounce is used on reloading of server modules. If multiple files are
  // saved at the same time, it'll aggregate into one reload within the
  // debounce interval period.
  let timeout = null;
  const debounceInterval = 1000; // 1 second debounce
  function reloadCaterServerModulesDebounced() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(reloadCaterServerModules, debounceInterval);
    return timeout;
  }

  // Sets up watches on server-side code for reloading
  function watchCaterServerModules() {
    Object.values(require.cache)
      .filter((mod) => mod.cater && mod.cater.side === 'server')
      .forEach((mod) => {
        // eslint-disable-next-line no-param-reassign
        mod.cater.watcher = fs.watch(mod.id, () => {
          const mtime = fs.statSync(mod.id).mtime.getTime();
          if (mod.cater.mtime === mtime) return; // This event often gets triggered multiple times
          // eslint-disable-next-line no-param-reassign
          mod.cater.mtime = mtime;
          reloadCaterServerModulesDebounced();
        });
        return true;
      });
    return true;
  }

  // Validates that any server load/reload has got React components
  function checkServerComponents() {
    ['App', 'Layout', 'Provider'].forEach((v) => {
      if (!handler[v] || typeof handler[v] !== 'function') {
        throw new Error(
          `Didn't find the ${v} component. Make sure you have a React component in app/${v.toLowerCase()}.js.`
        );
      }
    });
  }

  // Callback that gets this handler to unload cater-based modules and
  // reload from teh server entry point.
  handler.reload = function reload(firstRun = false) {
    unloadCaterModules();
    try {
      handler.load();
      checkServerComponents();
    } catch (e) {
      // If this is the first run through, don't start cater - throw an
      // error. Otherwise display the error and let the dev fix it up.
      if (firstRun) throw e;

      app.triggerError(e);
      console.error(e); // eslint-disable-line no-console
      return false;
    }

    tagCaterModules();
    watchCaterServerModules();
    return true;
  };
  handler.reload(true);

  return handler;
}

module.exports = generate;
