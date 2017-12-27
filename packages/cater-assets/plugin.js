// Copyright Jon Williams 2017. See LICENSE file.
const _path = require("path"); // _path to keep naming consistent in the babel transform

const generateBabelAssetTransform = function(extensions, assetState) {
  return function({ types: t }) {
    return {
      visitor: {
        ImportDeclaration: function(path, { file, opts }) {
          // Detect assets
          const importName = path.node.source.value;
          const ext = _path.extname(importName);
          if (!extensions.includes(ext)) return;

          const basename = importName.replace(/^assets\//, "");
          let content = assetState.manifest[basename];
          content = content ? _path.join(assetState.publicPath, content) : importName;

          const id = path.node.specifiers[0].local.name;
          const variable = t.variableDeclarator(t.identifier(id), t.stringLiteral(content));
          path.replaceWith({
            type: "VariableDeclaration",
            kind: "const",
            declarations: [variable]
          });
        }
      }
    };
  };
};

const generateWebpackImageRule = function(extensions, publicPath) {
  return {
    test: new RegExp(`\.(${extensions.join("|")})$`),
    use: [
      {
        loader: "file-loader",
        options: {
          publicPath: publicPath,
          name: "[name].[hash].[ext]",
          emitFile: true
        }
      }
    ]
  };
};

const generateWebpackStylesheetRule = function(extensions) {
  return {
    test: new RegExp(`\.(${extensions.join("|")})$`),
    use: [
      { loader: "style-loader" },
      { loader: "css-loader" },
      { loader: "sass-loader" },
    ]
  };
};

// Configure the webpack file loader to image assets.
const configureWebpackImageLoader = function(config, extensions, publicPath) {
  const rule = generateWebpackImageRule(extensions, publicPath);
  config.module.rules.push(rule);
  return rule;
};

/**
 * Configures Cater with an asset processing pipeline.
 */
module.exports = function(cater, options) {
  // Work out the extensions for different asset classes
  const imageExtensions = cater.assetExtensions.image || [];
  const stylesheetExtensions = cater.assetExtensions.stylesheet || [];
  const extensions = imageExtensions.concat(stylesheetExtensions);

  const dotExtensions = extensions.map(v => `.${v}`);
  if (extensions.length === 0) return; // Boundary condition. Not asset extensions.

  const assetState = {
    publicPath: cater.publicPath,
    manifest: {}
  };
  const babelTransform = generateBabelAssetTransform(dotExtensions, assetState);

  const imageRule = generateWebpackImageRule(imageExtensions, cater.publicPath);
  const scssRule = generateWebpackStylesheetRule(stylesheetExtensions);

  cater.on("webpack-compiled", function(cater, stats) {
    const manifestSource = stats.compilation.assets["manifest.json"].source();
    assetState.manifest = JSON.parse(manifestSource);
  });

  cater.on("configured", function(cater) {
    const rules = cater.sides.client.webpackConfig.module.rules;
    rules.push(imageRule);
    rules.push(scssRule);
    cater.sides.server.babel.plugins.push([babelTransform, {}]);
  });
};
