// Copyright Jon Williams 2017. See LICENSE file.

const isRuntime = (process.env.NODE_ENV === "production");
const moduleName = isRuntime ? 'cater-runtime' : 'cater-build';

module.exports = require(moduleName);

// // Production mode defers directly to cater-runtime
// if (process.env.NODE_ENV === "production") {
//   module.exports = require("cater-runtime");
// } else {
//   // // Otherwise we can use build mode
//   // const BuildCater = require("./src");

//   // module.exports = function(options) {
//   //   const app = new BuildCater(options);
//   //   const babelOptions = app.sides.server.babel;
//   //   babelOptions.cache = false;
//   //   babelOptions.ignore = /(\/node_modules\/|build\/)/;
//   //   require("babel-register")(babelOptions);
//   //   return app;
//   // };

//   // module.exports.readyCommandLine = function() {
//   //   const commands = require("./src/commands");
//   //   Object.keys(commands).forEach(key => (BuildCater.prototype[key] = commands[key]));
//   // };

//   // module.exports.harness = function() {
//   //   return require("./src/harness.js");
//   // };
// }
