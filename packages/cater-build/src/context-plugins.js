// Copyright Jon Williams 2017-2018. See LICENSE file.
const path = require('path');

/*
 * Loads plugin modules defined in the cater options.
 */

const configurePlugin = function(cater, name, options) {
  const resolve = require.resolve(name);
  if (!resolve) {
    throw `Cater plugin ${name} was specificed, but that module wasn't found. Check it's installed.`;
  }
  const plugin = require(name);
  const result = plugin(cater, options); // Plugin should export a function to configure itself
  plugin.componentRootPath = path.dirname(resolve);
  return plugin;
};

module.exports.autoDefinePlugins = function(cater) {
  const deps = Object.keys(cater.package.dependencies || {});
  const dev = Object.keys(cater.package.devDependencies || {});
  cater.plugins = {};

  deps
    .concat(dev)
    .filter((k) => k.startsWith('cater-'))
    .filter((k) => require.resolve(k).endsWith('plugin.js'))
    .forEach((k) => (cater.plugins[k] = null));

  return cater.plugins;
};

module.exports.configurePlugins = function(cater) {
  cater.configuredPlugins = {};

  cater.defaultPlugins.forEach((name) => {
    cater.configuredPlugins[name] = configurePlugin(cater, name, null);
  });

  Object.entries(cater.plugins).forEach(([name, options]) => {
    cater.configuredPlugins[name] = configurePlugin(cater, name, options);
  });

  return cater.configuredPlugins;
};
