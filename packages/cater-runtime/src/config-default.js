// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');
const BabelConfig = require('./config-babel');

const babel = BabelConfig();

const defaultOptions = {
  babel,
  babelRegisterDisable: false,
  assetHost: null,
  buildDirectory: 'build',
  bundleName: 'bundle',
  defaultContext: {},
  httpPort: 3000,
  mode: 'runtime',
  publicPath: '/static/',
  renderer: 'react',
  serveStaticAssets: null // Will default to true unless assetHost is seet
};

function generate() {
  return clone(defaultOptions);
}

module.exports = generate;
