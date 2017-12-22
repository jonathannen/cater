// Copyright Jon Williams 2017. See LICENSE file.

const plugin = {};

plugin.postConfiguration = function(context) {
  Object.entries(context.sides).forEach(([name, side]) => {
    side.babel.plugins.unshift(["emotion"]);
  });
};

module.exports = plugin;
