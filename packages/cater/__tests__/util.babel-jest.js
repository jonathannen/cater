// Copyright Jon Williams 2017. See LICENSE file.
const babelJest = require('babel-jest');

// Configures babel-jest with the babel configuration used on the server-side.
const createContext = require('../context');
const context = global.context = createContext();
module.exports = babelJest.createTransformer(context.server.babelOptions);