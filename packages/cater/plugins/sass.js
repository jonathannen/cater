// Copyright Jon Williams 2017. See LICENSE file.

const plugin = {};

plugin.postConfiguration = function(app) {

};

// module: {
//   rules: [{
//       test: /\.scss$/,
//       use: [{
//           loader: "style-loader" // creates style nodes from JS strings
//       }, {
//           loader: "css-loader" // translates CSS into CommonJS
//       }, {
//           loader: "sass-loader" // compiles Sass to CSS
//       }]
//   }]
// }


// const ExtractTextPlugin = require("extract-text-webpack-plugin");

// const extractSass = new ExtractTextPlugin({
//     filename: "[name].[contenthash].css",
//     disable: process.env.NODE_ENV === "development"
// });

// module.exports = {
// 	...
//     module: {
//         rules: [{
//             test: /\.scss$/,
//             use: extractSass.extract({
//                 use: [{
//                     loader: "css-loader"
//                 }, {
//                     loader: "sass-loader"
//                 }],
//                 // use style-loader in development
//                 fallback: "style-loader"
//             })
//         }]
//     },
//     plugins: [
//         extractSass
//     ]
// };

module.exports = plugin;
