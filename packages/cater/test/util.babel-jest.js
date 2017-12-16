// Copyright Jon Williams 2017. See LICENSE file.
const babelJest = require('babel-jest');
const path = require('path');
const createContext = require('../context');

let transformer = null;

module.exports.process = function(src, filename, config, transformOptions) {
    const root = process.cwd();

    if(filename.endsWith('.test.js')) {
        transformer = null;
    }

    if(transformer == null) {
        var directory = path.dirname(filename);
        const context = createContext(directory);
        transformer = babelJest.createTransformer(context.server.babelOptions);
        require('babel-register')(context.server.babelOptions);
    }

    return transformer.process(src, filename, config, transformOptions);
}