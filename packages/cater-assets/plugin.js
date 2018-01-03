// Copyright Jon Williams 2017-2018. See LICENSE file.
// TODO: Windows support. This code assumes unix-style paths, which marry
// up with web-based ones.
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

/**
 * Generates a Babel transform for the server-side rendering of assets. This
 * transform will convert examples like:
 *
 *     import css from 'assets/my-stylesheet.scss';
 *
 * To something like:
 *
 *     var css = '/static/my-stylesheet.4bb92b2f79c434526c6ea5bdf409ff96.css;
 *
 * This allows both the server and client sides to have the same asset
 * definition approach.
 */
function generateBabelAssetTransform(state) {
  return function babelTransform({ types: t }) {
    return {
      visitor: {
        ImportDeclaration: function importDeclaration(declaration) {
          // Detect assets
          const importName = declaration.node.source.value;
          const ext = path.extname(importName).slice(1);
          if (!state.extensions.includes(ext)) return;

          // Convert "scss" and friends to plain "css".
          let basename = importName.replace(/^assets\//, '');
          if (state.stylesheetExtensions.includes(ext)) {
            basename = `${basename.slice(0, basename.length - ext.length)}css`;
          }

          // Convert the import in to setting a variable with the asset path
          let content = state.manifest[basename];
          content = content ? path.join(state.publicPath, content) : importName;

          // Is a CDN configured?
          if (state.assetHost) {
            content = `${state.assetHost}${content}`;
          }

          const id = declaration.node.specifiers[0].local.name;
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

function generateWebpackImageRule(state) {
  return {
    test: new RegExp(`\\.(${state.imageExtensions.join('|')})$`),
    use: [
      {
        loader: 'file-loader',
        options: {
          publicPath: state.publicPath,
          name: '[name].[hash].[ext]',
          emitFile: true
        }
      }
    ]
  };
}

function generateWebpackStylesheetRule(state) {
  return {
    test: new RegExp(`\\.(${state.stylesheetExtensions.join('|')})$`),
    use: state.extractCssPlugin.extract({
      use: [
        { loader: 'css-loader', options: { minimize: !state.debug } }, //
        { loader: 'sass-loader' }
      ]
    })
  };
}

/**
 * Configures Cater with an asset processing pipeline.
 */
module.exports = function plugin(cater, options) {
  // Work out the extensions for different asset classes
  const state = {
    assetHost: cater.assetHost,
    // debug: !!cater.debug, // TODO
    imageExtensions: options.image || [],
    publicPath: cater.publicPath,
    manifest: {},
    stylesheetExtensions: options.stylesheet || []
  };
  state.extensions = state.imageExtensions.concat(state.stylesheetExtensions);
  if (state.extensions.length === 0) return; // Boundary condition. Not asset extensions.

  state.extractCssPlugin = new ExtractTextPlugin({
    filename: '[name].[contenthash].css'
  });

  // Set up the babel transform for all assets. This will turn
  // import myNameGif from 'assets/name.gif' to myNameGif = path-to-file.
  const babelTransform = generateBabelAssetTransform(state);
  const imageRule = generateWebpackImageRule(state);
  const cssRule = generateWebpackStylesheetRule(state);

  // When webpack compiles, grab the manifests for use by the babel
  // transformed. This will enable the transform to return the real asset
  // path.
  cater.on('webpack-compiled', (_, stats) => {
    const manifestSource = stats.compilation.assets['manifest.json'].source();
    state.manifest = JSON.parse(manifestSource);
  });

  cater.on('configured', () => {
    const config = cater.sides.client.webpackConfig;
    config.module.rules.push(imageRule);
    config.module.rules.push(cssRule);
    config.plugins.push(state.extractCssPlugin);

    cater.sides.server.babel.plugins.push([babelTransform, {}]);
  });
};
