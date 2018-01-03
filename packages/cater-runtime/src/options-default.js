const clone = require('clone');
const OptionsBabel = require('./options-babel');

const babel = OptionsBabel();

const defaultOptions = {
  babel,
  assetHost: null,
  buildDirectory: 'build',
  bundleFilename: 'bundle.js',
  httpPort: 3000,
  mode: 'runtime',
  publicPath: '/static/',
  renderer: 'react',
  serverBundleFilename: 'server-bundle.js',
  serveStaticAssets: true
};

function generate(provided = {}) {
  return Object.assign(clone(defaultOptions), provided);
}

module.exports = generate;
