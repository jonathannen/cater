const clone = require('clone');

const defaultOptions = {
  presets: ['env', 'react'],
  plugins: [
    ['add-module-exports'],
    ['transform-class-properties'],
    ['transform-object-rest-spread']
  ]
};

function generate() {
  return clone(defaultOptions);
}

module.exports = generate;
