// Copyright Jon Williams 2017-2018. See LICENSE file.
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const vm = require('vm');

/**
 * # Cater Assets
 *
 * Converts references like:
 *
 *     import css from 'assets/my-stylesheet.scss';
 *
 * To something like:
 *
 *     var css = '/static/my-stylesheet.4bb92b2f79c434526c6ea5bdf409ff96.css;
 *
 * Works with CSS, SCSS and most image formats. Below a certain size, assets
 * will be converted to data URIs. You can force an asset of any size to be
 * a data URI by adding `.datauri` to the filename.
 *
 * Assets works primarily via the client-side WE rules. This plugin will
 * add module rules for images, stylesheets and a special loader for `.datauri`.
 * Once the webpack compilation has taken place, those outputs are injected
 * into a babel transform on the server-side.
 *
 * Options:
 *
 *     **dataURISizeLimit**
 *     The size in bytes that image assets are turned into data URIs instead
 *     of an image link. Defaults to 4KB.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * @module cater-assets
 */

// Default size that images are turned into data uris
const DEFAULT_DATA_URI_SIZE_LIMIT = 1024 * 4; // 4KB

const DEFAULT_OPTIONS = {
  image: ['gif', 'jpeg', 'jpg', 'png', 'svg'],
  stylesheet: ['css', 'scss']
};

/*
 * Generates a Babel transform for the server-side rendering of assets. This
 * allows both the server and client sides to have the same asset definition
 * approach.
 *
 * To keep things consistent, the Babel (server) side is driven off Webpack.
 * Once the client Webpack compilation completes, the assets are fed over
 * via the manifest. This code then interrogates this manifest.
 *
 * Transpiles:
 *     import cuteCatPicture from 'assets/cat.png'
 *
 * To something like:
 *     const cuteCatPicture = 'https://cdn.example.org/cat.4bb92b2f79c434526c6ea5bdf409ff96.png';
 *
 * The substituion could also include data URIs. Whatever is supported on the
 * Webpack side is mirrored here.
 */
function generateBabelAssetTransform(state) {
  return function babelTransform({ types: t }) {
    return {
      visitor: {
        ImportDeclaration: function importDeclaration(declaration) {
          // Detect assets
          const importName = declaration.node.source.value;
          const ext = importName.split('.').pop();
          if (!state.extensions.includes(ext)) return;

          // Convert "scss" and friends to plain "css".
          let basename = importName.replace(/^assets\//, '');
          if (state.stylesheetExtensions.includes(ext)) {
            basename = `${basename.slice(0, basename.length - ext.length)}css`;
          }

          // Convert the import in to setting a variable with the asset path
          const content = state.manifest[basename] || importName;

          // The import could be assigned to a varible, or nothing. If it's
          // nothing, then put in a random variable name. This is necessary
          // so that things like extracttext for css still trigger.
          const specifier = declaration.node.specifiers[0];
          const id = specifier
            ? specifier.local.name
            : `__import${Math.floor(Math.random() * Math.floor(99999))}${Date.now()}`;

          const variable = t.variableDeclarator(t.identifier(id), t.stringLiteral(content));
          declaration.replaceWith({
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [variable]
          });
        }
      }
    };
  };
}

/*
 * Loader rules intended for the client Webpack.
 */
function generateWebpackImageRules(state) {
  // Matches examples like cat.png.data.uri
  const dataURIRule = {
    test: /\.datauri$/,
    use: [{ loader: path.join(__dirname, 'data-uri-loader.js') }]
  };

  // Matches cat.png, cat.jpg, etc.
  const imageRule = {
    test: state.imageFilenameRegExp,
    use: [
      {
        loader: 'url-loader',
        options: {
          publicPath: state.assetHost + state.publicPath,
          name: '[name].[hash].[ext]',
          limit: state.dataURISizeLimit
        }
      }
    ]
  };

  return [dataURIRule, imageRule];
}

/*
 * Loader rules for SaaS (SCSS) and CSS files.
 */
function generateWebpackStylesheetRule(state) {
  return {
    test: new RegExp(`\\.(${state.stylesheetExtensions.join('|')})$`),
    use: state.extractCssPlugin.extract({
      use: [
        { loader: 'css-loader', options: { minimize: state.mimimize } }, //
        { loader: 'sass-loader' }
      ]
    })
  };
}

// Called when the client-side webpack is done. The manifest and the generated
// modules are passed over to the server-side babel to keep them aligned.
function onWebpackCompiled(state, stats) {
  // Parse the manifest first. This will catch the widest range of assets
  const manifestSource = stats.compilation.assets['manifest.json'].source();
  const manifest = JSON.parse(manifestSource);

  // Convert the manifest to full paths
  Object.keys(manifest).forEach((k) => {
    // changes the manifest refernence to something like
    // https://yourcnd.example.org/static/name.21323131.jpg
    manifest[k] = state.assetHost + state.publicPath + manifest[k];

    const reassign = state;
    if (k === `${state.bundleName}.css`) {
      reassign.defaultContext.globalStyleLinks = [manifest[k]];
    }
    if (k === `${state.bundleName}.js`) {
      reassign.defaultContext.globalScriptLinks = [manifest[k]];
    }
  });

  // Run through the modules looking for assets. This will pick up assets
  // that may have been converted to data URIs
  stats.compilation.modules.forEach((mod) => {
    const id = mod.id.toString();
    if (!id.match(state.assetFilenameRegExp) || !id.startsWith('./assets/')) return;

    const name = id.substring('./assets/'.length);
    // Already in the manifest? No need to process.
    if (manifest[name]) return;

    const source = mod._source.source(); // eslint-disable-line no-underscore-dangle

    // Run the asset module in a sandbox VM
    const sandbox = { module: { exports: {} } };
    const script = new vm.Script(source);
    script.runInNewContext(sandbox);

    manifest[name] = sandbox.module.exports;
  });

  state.manifest = manifest; // eslint-disable-line no-param-reassign
  return manifest;
}

// Called when the app is configured at dev and build time. This injects
// the necessary rules and transforms into the client and server sides
function onConfigured(app, state) {
  // Update state based upon any changes
  const reassign = state;
  reassign.assetHost = app.assetHost || '';
  reassign.bundleName = app.bundleName;
  reassign.defaultContext = app.defaultContext;

  const babelTransform = generateBabelAssetTransform(state);
  const imageRules = generateWebpackImageRules(state);
  const cssRule = generateWebpackStylesheetRule(state);

  // Alter the client and server-side webpack configurations
  const webpack = app.sides.client.webpackConfig;

  webpack.module.rules.push(...imageRules);
  webpack.module.rules.push(cssRule);
  webpack.plugins.push(state.extractCssPlugin);

  // Update webpack with the CDN if necessary
  if (state.assetHost.length > 0) {
    webpack.output.publicPath = state.assetHost + webpack.output.publicPath;
  }

  // Update Server side to handle images
  app.sides.server.babel.plugins.push([babelTransform, {}]);
}

// Configures Cater with an asset processing pipeline.
module.exports = function plugin(caterApp, providedOptions) {
  const options = providedOptions || DEFAULT_OPTIONS;

  // Work out the extensions for different asset classes
  const state = {
    assetHost: caterApp.assetHost,
    imageExtensions: options.image || [],
    publicPath: caterApp.publicPath,
    manifest: {},
    mimimize: caterApp.mode !== 'dev',
    stylesheetExtensions: options.stylesheet || []
  };
  state.extensions = state.imageExtensions.concat(state.stylesheetExtensions);
  if (state.extensions.length === 0) return false; // Boundary condition. Not asset extensions.

  // Plugin rule to pull out the CSS stylesheets
  const cssFilename = caterApp.mode === 'dev' ? '[name].css' : '[name].[contenthash].css';
  state.extractCssPlugin = new ExtractTextPlugin({ filename: cssFilename });

  // Image extensions
  state.imageFilenameRegExp = new RegExp(`\\.(${state.imageExtensions.join('|')})$`);
  state.dataURISizeLimit = options.dataURISizeLimit || DEFAULT_DATA_URI_SIZE_LIMIT;

  // List and match for all asset extensions
  state.extensions.push('datauri');
  state.assetFilenameRegExp = new RegExp(`\\.(${state.extensions.join('|')})$`);

  caterApp.on('webpack-compiled', (_, stats) => onWebpackCompiled(state, stats));
  caterApp.on('configured', (app) => onConfigured(app, state));

  return true;
};
