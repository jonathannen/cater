// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const babelJest = require('babel-jest');
const cater = require("cater");
const path = require('path');

const context = cater.createContext();
delete context.sides.server.babelOptions.resolveModuleSource;

module.exports = babelJest.createTransformer(context.sides.server.babelOptions);