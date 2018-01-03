// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');
const { DefaultOptions } = require('cater-runtime');

const caterAssetPluginDefaults = {
  image: ['gif', 'jpeg', 'jpg', 'png', 'svg'],
  stylesheet: ['css', 'scss']
};

// Combine the
const buildDefaults = {
  defaultPlugins: [
    ['cater-assets', caterAssetPluginDefaults] // asset extensions
  ],
  entryScriptFilename: '_entry.js',
  extensions: ['.js', '.jsx', ''],
  mode: 'dev',
  plugins: 'auto',
  publicPath: '/static/',
  sideNames: ['client', 'server'],
  staticDirectory: 'static',
  universalNames: ['app'],
  universalPrefix: 'app'
};

// Combine the build-time defaults with the runtime ones from cater-runtime
const runtimeDefaults = DefaultOptions();
const defaultOptions = Object.assign(runtimeDefaults, buildDefaults);

function generate(provided = {}) {
  return Object.assign(clone(defaultOptions), provided);
}
module.exports = generate;
