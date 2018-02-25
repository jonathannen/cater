// Copyright Jon Williams 2017-2018. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const babelJest = require('babel-jest');
const Cater = require('cater');
const fs = require('fs');
const path = require('path');

const CARET_PATHS = ['app/^', 'client/^', 'server/^'];
const CARET_PATH_SEPARATOR = '?filename=';

const babelConfig = new Cater().sides.server.babel;
delete babelConfig.resolveModuleSource;

babelConfig.resolveModuleSource = function resolveModuleSource(source, filename) {
  // Caret paths like server/^ need the context of the file attempting
  // the import. Since we can't pass it through, we put a forbidden path
  // separator in to send over the filename context.
  if (CARET_PATHS.includes(source)) return `${source}${CARET_PATH_SEPARATOR}${filename}`;
  return source;
};

module.exports = babelJest.createTransformer(babelConfig);
