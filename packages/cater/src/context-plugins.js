// Copyright Jon Williams 2017. See LICENSE file.
const path = require('path');

module.exports.autoDefinePlugins = function(cater) {
  const deps = Object.keys(cater.package.dependencies || {});
  const dev = Object.keys(cater.package.devDependencies || {});
  cater.plugins = {};

  deps
    .concat(dev)
    .filter(k => k.startsWith("cater-"))
    .filter(k => require.resolve(k).endsWith("plugin.js"))
    .forEach(k => (cater.plugins[k] = null));

  return cater.plugins;
};

module.exports.configurePlugins = function(cater) {
  cater.configuredPlugins = {};
  Object.entries(cater.plugins).forEach(([name, options]) => {
    const resolve = require.resolve(name);
    if (!resolve) {
      throw `Cater plugin ${name} was specificed, but that module wasn't found. Check it's installed.`;
    }
    const plugin = (cater.configuredPlugins[name] = require(name));
    const result = plugin(cater, options); // Plugin should export a function to configure itself

    plugin.componentRootPath = path.dirname(resolve);
  });
  return cater.configuredPlugins;
};
