// Copyright Jon Williams 2017. See LICENSE file.

const mode = process.env.CATER_MODE || (process.env.NODE_ENV === "production" ? "runtime" : "build");
const runtime = mode === "runtime";
const moduleName = runtime ? "cater-runtime" : "cater-build";

try {
  if (!runtime) require.resolve(moduleName);
} catch (e) {
  throw new Error(
    `Running Cater in build mode, but the cater-build package isn't installed. Add to your project as a development dependency using npm or yarn.`
  );
}

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
