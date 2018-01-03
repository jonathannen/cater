// Copyright Jon Williams 2017-2018. See LICENSE file.
const { HandlerCater } = require('cater-runtime');

const CATER_MODULE_NAME_REGEX = /(\/client\/|\/server\/|\/app\/)/;

/**
 * Unloads cater-based modules from the regular node require cache.
 */
function unloadCaterBasedModules() {
  const moduleNames = Object.keys(require.cache);
  const unloadList = moduleNames.filter((v) => v.match(CATER_MODULE_NAME_REGEX));
  unloadList.forEach((v) => delete require.cache[v]);
  return true;
}

/**
 * Creates a handler with the given entry point (file that loads server
 * components). Plus the bundlePath.
 */
function generate(renderer, entryPath, bundlePath, publicPath, assetHost) {
  const handler = HandlerCater(renderer, entryPath, bundlePath, publicPath, assetHost);

  // Callback that gets this handler to unload cater-based modules and
  // reload from teh server entry point.
  handler.reload = function reload(firstRun = false) {
    unloadCaterBasedModules();
    try {
      handler.load();

      if (!handler.App || typeof handler.App !== 'function') {
        throw new Error(
          "Didn't find an App component. Make sure you have a React component in app/app.js."
        );
      }

      if (!handler.Layout || typeof handler.Layout !== 'function') {
        throw new Error(
          'Hmm. Found a empty Layout component. Have you got a blank component in app/layout.js?'
        );
      }

      return true;
    } catch (e) {
      // If this is the first run through, don't start cater - throw an
      // error. Otherwise display the error and let the dev fix it up.
      if (firstRun) throw e;
      console.error(e); // eslint-disable-line no-console
      return false;
    }
  };
  handler.reload(true);

  return handler;
}

module.exports = generate;
