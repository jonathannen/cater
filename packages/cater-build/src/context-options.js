// Copyright Jon Williams 2017-2018. See LICENSE file.

/**
 * Represents the option set passed to cater to initialize an app instance.
 *
 * A null value here indicates the option is programmatic - that is the default
 * is generated from the environment at startup. These values can be supplied
 * as options.
 */
const DEFAULT_OPTIONS = {
  // build: null,
  // debug: null,
  // hot: true,
  buildDirectory: 'build',
  bundleFilename: 'bundle.js',
  defaultPlugins: ['cater-assets'],
  entryScriptFilename: '_entry.js',
  extensions: ['.js', '.jsx', ''],
  httpPort: 3000,
  assetExtensions: {
    image: ['gif', 'jpeg', 'jpg', 'png', 'svg'],
    stylesheet: ['css', 'scss']
  },
  plugins: 'auto',
  publicPath: '/static/',
  sideNames: ['client', 'server'],
  staticDirectory: 'static',
  universalNames: ['app'],
  universalPrefix: 'app'
};

DEFAULT_OPTIONS.babel = {
  presets: ['env', 'react'],
  plugins: [['add-module-exports'], ['transform-class-properties']]
};

module.exports = DEFAULT_OPTIONS;
