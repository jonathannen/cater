const clone = require('clone');
const OptionsBabel = require('./options-babel');

const babel = OptionsBabel();

const defaultOptions = {
  babel,
  assetHost: null,
  buildDirectory: 'build', // TODO
  bundleFilename: 'bundle.js', // TODO
  httpPort: 3000,
  mode: 'runtime',
  publicPath: '/static/',
  serverBundleFilename: 'server-bundle.js', // TODO
  serveStaticAssets: true
};

function generate(provided = {}) {
  return Object.assign(clone(defaultOptions), provided);
}

module.exports = generate;
