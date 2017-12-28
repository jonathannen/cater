// Copyright Jon Williams 2017. See LICENSE file.
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// _path as path is a common variable convention in the babel transform
const _path = require("path");

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
const generateBabelAssetTransform = function(state) {
  return function({ types: t }) {
    return {
      visitor: {
        ImportDeclaration: function(path, { file, opts }) {
          // Detect assets
          const importName = path.node.source.value;
          const ext = _path.extname(importName).slice(1);
          if (!state.extensions.includes(ext)) return;

          // Convert "scss" and friends to plain "css".
          let basename = importName.replace(/^assets\//, "");
          if (state.stylesheetExtensions.includes(ext)) {
            basename = basename.slice(0, basename.length - ext.length) + "css";
          }

          // Convert the import in to setting a variable with the asset path
          let content = state.manifest[basename];
          content = content ? _path.join(state.publicPath, content) : importName;
          const id = path.node.specifiers[0].local.name;
          const variable = t.variableDeclarator(t.identifier(id), t.stringLiteral(content));
          path.replaceWith({ type: "VariableDeclaration", kind: "const", declarations: [variable] });
        }
      }
    };
  };
};

const generateWebpackImageRule = function(state) {
  return {
    test: new RegExp(`\.(${state.imageExtensions.join("|")})$`),
    use: [
      {
        loader: "file-loader",
        options: {
          publicPath: state.publicPath,
          name: "[name].[hash].[ext]",
          emitFile: true
        }
      }
    ]
  };
};

const generateWebpackStylesheetRule = function(state) {
  return {
    test: new RegExp(`\.(${state.stylesheetExtensions.join("|")})$`),
    use: state.extractCssPlugin.extract({
      use: [
        { loader: "css-loader" }, //
        { loader: "sass-loader" }
      ]
    })
  };
};

/**
 * Configures Cater with an asset processing pipeline.
 */
module.exports = function(cater, options) {
  // Work out the extensions for different asset classes
  const state = {
    imageExtensions: cater.assetExtensions.image || [],
    publicPath: cater.publicPath,
    manifest: {},
    stylesheetExtensions: cater.assetExtensions.stylesheet || []
  };
  state.extensions = state.imageExtensions.concat(state.stylesheetExtensions);
  if (state.extensions.length === 0) return; // Boundary condition. Not asset extensions.

  state.extractCssPlugin = new ExtractTextPlugin({
    filename: "[name].[contenthash].css"
  });

  // Set up the babel transform for all assets. This will turn
  // import myNameGif from 'assets/name.gif' to myNameGif = path-to-file.
  const babelTransform = generateBabelAssetTransform(state);
  const imageRule = generateWebpackImageRule(state);
  const cssRule = generateWebpackStylesheetRule(state);

  // When webpack compiles, grab the manifests for use by the babel
  // transformed. This will enable the transform to return the real asset
  // path.
  cater.on("webpack-compiled", function(cater, stats) {
    const manifestSource = stats.compilation.assets["manifest.json"].source();
    const manifest = (state.manifest = JSON.parse(manifestSource));
  });

  cater.on("configured", function(cater) {
    const config = cater.sides.client.webpackConfig;
    const rules = config.module.rules;
    rules.push(imageRule);
    rules.push(cssRule);
    config.plugins.push(state.extractCssPlugin);

    cater.sides.server.babel.plugins.push([babelTransform, {}]);
  });
};
