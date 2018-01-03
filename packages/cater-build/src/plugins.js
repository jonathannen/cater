// Copyright Jon Williams 2017-2018. See LICENSE file.
const path = require('path');

/*
 * Loads plugin modules defined in the cater options.
 */

function autoDefinePlugins(pkg, defaultPlugins) {
  const deps = Object.keys(pkg.dependencies || {});
  const dev = Object.keys(pkg.devDependencies || {});
  const plugins = {};

  const configuredDefaults = defaultPlugins
    .filter((entry) => Array.isArray(entry))
    .map(([name]) => name);

  deps
    .concat(dev)
    .filter((k) => k.startsWith('cater-'))
    .filter((k) => require.resolve(k).endsWith('plugin.js'))
    .filter((k) => !configuredDefaults.includes(k))
    .forEach((k) => {
      plugins[k] = null;
    });

  return plugins;
}

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

function configurePlugins(app, plugins, options) {
  const configuredPlugins = {};

  const list = options.defaultPlugins.concat(Object.entries(plugins));
  list.forEach((entry) => {
    const [name, pluginOptions] = Array.isArray(entry) ? entry : [entry, null];
    configuredPlugins[name] = configurePlugin(app, name, pluginOptions);
  });

  return configuredPlugins;
}

function configure(app, options) {
  let plugins = [];
  if (options.plugins === 'auto') {
    const pkg = app.package();
    plugins = autoDefinePlugins(pkg, options.defaultPlugins);
  }

  return configurePlugins(app, plugins, options);
}

module.exports = configure;
