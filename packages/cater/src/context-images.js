// Copyright Jon Williams 2017. See LICENSE file.

// Adds in the Babel server-side image asset plugin. This will change
// import "cat.gif" to retun the hashed filename of the asset.
const configureBabel = function(context, side) {
  side.babel.plugins.push([
    "transform-assets",
    {
      extensions: context.assetExtensions.image,
      name: `${context.publicPath}[name].[hash].[ext]`
    }
  ]);
};

// Configure the webpack file loader to image assets.
const configureWebpack = function(context, side) {
  const exts = context.assetExtensions["image"].join("|");

  side.webpackConfig.module.rules.push({
    test: new RegExp(`\.(${exts})$`),
    use: [
      {
        loader: "file-loader",
        options: {
          publicPath: context.publicPath,
          name: "[name].[hash].[ext]",
          emitFile: side.typeClient
        }
      }
    ]
  });
};

/**
 * Updates the App context to handle client and server-side images through
 * El Webpacko.
 */
const configureImageLoaders = function(context) {
  context.clientSides().forEach(side => configureWebpack(context, side));
  context.serverSides().forEach(side => configureBabel(context, side));
};

module.exports = configureImageLoaders;
