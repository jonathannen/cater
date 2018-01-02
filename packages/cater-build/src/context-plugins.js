// Copyright Jon Williams 2017-2018. See LICENSE file.
const path = require('path');

/*
 * Loads plugin modules defined in the cater options.
 */

function configurePlugin(cater, name, options) {
  const resolve = require.resolve(name);
  if (!resolve) {
    throw new Error(
      `Cater plugin ${name} was specificed, but that module wasn't found. Check it's installed.`
    );
  }
  const plugin = require(name); // eslint-disable-line global-require, import/no-dynamic-require

  // Plugin should export a function to configure itself
  plugin.result = plugin(cater, options);
  plugin.componentRootPath = path.dirname(resolve);
  return plugin;
}

function autoDefinePlugins(cater) {
  const deps = Object.keys(cater.package.dependencies || {});
  const dev = Object.keys(cater.package.devDependencies || {});
  const plugins = {};

  deps
    .concat(dev)
    .filter((k) => k.startsWith('cater-'))
    .filter((k) => require.resolve(k).endsWith('plugin.js'))
    .forEach((k) => {
      plugins[k] = null;
    });

  return plugins;
}

function configurePlugins(cater) {
  const configuredPlugins = {};

  cater.defaultPlugins.forEach((name) => {
    configuredPlugins[name] = configurePlugin(cater, name, null);
  });

  Object.entries(cater.plugins).forEach(([name, options]) => {
    configuredPlugins[name] = configurePlugin(cater, name, options);
  });

  return configuredPlugins;
}

module.exports = { autoDefinePlugins, configurePlugins };
