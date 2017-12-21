// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const babelJest = require("babel-jest");
const cater = require("cater");
const path = require("path");

const babelOptions = new cater.Context().sides.server.babel;
delete babelOptions.resolveModuleSource;

module.exports = babelJest.createTransformer(babelOptions);
