
const clone = require('clone');

const BABEL_OPTIONS = {
  cache: false,
  ignore: /(\/node_modules\/|build\/)/,
  presets: ["env", "react"],
  plugins: [
    ["add-module-exports"],
    ["transform-class-properties"],
  ]
};

module.exports = function() {
  return clone(BABEL_OPTIONS);
}
