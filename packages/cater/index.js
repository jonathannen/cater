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
