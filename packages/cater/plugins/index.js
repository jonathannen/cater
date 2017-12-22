// Copyright Jon Williams 2017. See LICENSE file.

const events = ["postConfiguration"];
const builtInPlugins = ["emotion"];

const plugins = {
  entries: []
};

plugins.configure = function(context) {
  context.plugins.forEach(name => {
    if (!require.resolve(name)) {
      throw `Cater plugin ${name} was specificed, but that module wasn't found. Check it's installed.`;
    }

    plugins.entries.push(require(name));
  });
  return plugins;
};

events.forEach(name => {
  plugins[name] = function(context) {
    plugins.entries.forEach(plugin => {
      if (plugin[name] === undefined) return;
      plugin[name](context);
    });
  };
});

module.exports = plugins;
