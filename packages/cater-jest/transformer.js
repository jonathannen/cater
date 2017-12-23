// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const babelJest = require("babel-jest");
const Cater = require("cater");

const babelOptions = new Cater().sides.server.babel;
delete babelOptions.resolveModuleSource;

module.exports = babelJest.createTransformer(babelOptions);
