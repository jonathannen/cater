const clone = require('clone');

const BABEL_OPTIONS = {
  cache: false,
  ignore: /(\/node_modules\/(?!(cater$|cater-))|build\/)/,
  presets: ['env', 'react'],
  plugins: [['add-module-exports'], ['transform-class-properties']]
};

module.exports = function() {
  return clone(BABEL_OPTIONS);
};
