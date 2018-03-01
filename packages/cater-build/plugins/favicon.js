// Copyright Jon Williams 2017-2018. See LICENSE file.
const fs = require('fs');
const loaderUtils = require('loader-utils');
const path = require('path');
const { RawSource } = require('webpack-sources');
const { ServerContext } = require('cater-runtime');

/**
 * Standard cater-build plugin that add Favicon handling into the build process.
 * This uses the standard output of https://realfavicongenerator.net/ - which
 * is expected to be in the <appRoot>/assets/favicon directory.
 *
 * When generating on https://realfavicongenerator.net/ don't select to
 * have the favicons in a directory. This plugin manages the actual mapping
 * process.
 */

const ASSET_LIST = [
  'android-chrome-192x192.png',
  'android-chrome-384x384.png',
  'apple-touch-icon.png',
  'browserconfig.xml',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon.ico',
  'mstile-150x150.png',
  'safari-pinned-tab.svg',
  'site.webmanifest'
];
const FAVICON_ASSETS_DIRECTORY = ['assets', 'favicon'];

function addHashToFilename(content, filename) {
  const hash = loaderUtils.getHashDigest(content, 'md5');
  const parts = filename.split('.');
  parts.splice(-1, 0, hash);
  return parts.join('.');
}

class Favicon {
  constructor(appRootPath) {
    this.appRootPath = appRootPath;
    this.assetPath = path.join(appRootPath, ...FAVICON_ASSETS_DIRECTORY);
    this.serverContext = new ServerContext();
  }

  // Configures the favicon object based upon the current working directory.
  // Returns true if the configuration is valid - false if not.
  configure() {
    // Does the favicon directory exist and does it have an files of interest
    // in it?
    if (!this.directoryExists()) return false;
    if (Object.keys(this.mapAssetFiles()).length === 0) return false;

    return true;
  }

  directoryExists() {
    if (!fs.existsSync(this.assetPath)) return false;
    return fs.statSync(this.assetPath).isDirectory();
  }

  loadFile(name, encoding = null) {
    const filename = this.assetMap[name];
    if (!fs.existsSync(filename)) {
      throw new Error(`Expected to find ${filename}, but the file has moved or been deleted`);
    }
    return fs.readFileSync(filename, encoding);
  }

  mapAssetFiles() {
    this.assetMap = ASSET_LIST.reduce((prev, curr) => {
      const candidate = path.join(this.assetPath, curr);
      if (!fs.existsSync(candidate)) return prev;
      if (fs.statSync(candidate).isFile()) prev[curr] = candidate;
      return prev;
    }, {});
    return this.assetMap;
  }
}

// Called when the Cater App is being built
function built(app, build) {
  const favicon = app._favicon;
  if (!favicon.configure()) return false;

  const { serverContext } = favicon;
  build.emitConfigurationFile('cater-favicon', { serverContext });
  return true;
}

function compiling(app, side, compiler) {
  const favicon = app._favicon;
  if (!favicon.configure()) return false;

  if (side.typeClient) {
    compiler.plugin('emit', (compilation, callback) => {
      const assets = Object.keys(favicon.assetMap);
      const images = assets.filter((v) => v.match(/\.(ico|png|svg)$/));

      const mapping = images.reduce((prev, curr) => {
        const buffer = favicon.loadFile(curr);
        const filename = addHashToFilename(buffer, curr);
        compilation.assets[filename] = new RawSource(buffer);

        const location = path.join((app.assetHost || '') + app.publicPath, filename);
        prev[curr] = location;
        return prev;
      }, {});

      const metadata = assets.filter((v) => v.match(/\.(webmanifest|xml)$/));
      metadata.forEach((name) => {
        const content = Object.entries(mapping).reduce((prev, [k, v]) => {
          const next = prev.replace(`/${k}`, v);
          return next;
        }, favicon.loadFile(name, 'utf8'));

        const filename = addHashToFilename(content, name);
        const location = path.join((app.assetHost || '') + app.publicPath, filename);
        mapping[name] = location;
        compilation.assets[filename] = new RawSource(content);
      });

      // Special handing for favicon.ico - have an un-fingerprinted version
      // that can be used for directly serving to browsers.
      if (favicon.assetMap['favicon.ico']) {
        compilation.assets['favicon.ico'] = new RawSource(favicon.loadFile('favicon.ico'));
      }

      Object.entries({
        'apple-touch-icon.png': { rel: 'apple-touch-icon', sizes: '180x180' },
        'favicon-32x32.png': { rel: 'icon', sizes: '32x32' },
        'favicon-16x16.png': { rel: 'icon', sizes: '16x16' },
        'site.webmanifest': { rel: 'manifest ' }
      }).forEach(([k, v]) => {
        v.href = mapping[k];
        console.log(v);
        if (!v.href) return;
        favicon.serverContext.addLink(v);
      });

      const browserConfig = mapping['browserconfig.xml'];
      if (browserConfig) {
        favicon.serverContext.addMeta({ name: 'msapplication-config', content: browserConfig });
      }

      app.serverContexts.favicon = favicon.serverContext;

      callback();
    });
  }

  return true;
}

function plugin(cater) {
  cater._favicon = new Favicon(cater.appRootPath);
}

Object.assign(plugin, {
  built,
  compiling
});
module.exports = plugin;
