// Copyright Jon Williams 2017. See LICENSE file.
const babelJest = require('babel-jest');
const cater = require("cater");
const path = require('path');

const context = cater.createContext();
delete context.sides.server.babelOptions.resolveModuleSource;

module.exports = babelJest.createTransformer(context.sides.server.babelOptions);