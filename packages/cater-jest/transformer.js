// Copyright Jon Williams 2017-2018. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const babelJest = require('babel-jest');
const Cater = require('cater');
const fs = require('fs');
const path = require('path');

const CARET_PATHS = ['app/^', 'client/^', 'server/^'];
const CARET_PATH_SEPARATOR = '?filename=';

const babelOptions = new Cater().sides.server.babel;
delete babelOptions.resolveModuleSource;

babelOptions.resolveModuleSource = function resolveModuleSource(source, filename) {
  // Caret paths like server/^ need the context of the file attempting
  // the import. Since we can't pass it through, we put a forbidden path
  // separator in to send over the filename context.
  if (CARET_PATHS.includes(source)) return `${source}${CARET_PATH_SEPARATOR}${filename}`;

  // Asset discovery in test. Find the app directory and funnel from there
  // TODO: Will eventually need this to work in context where the assets
  // are in multiple places. This code also means having the asset location
  // hard-coded.
  if (source.startsWith('assets/')) {
    let currentDirectory = path.dirname(filename);
    let nextDirectory = path.join(currentDirectory, '..');
    while (currentDirectory !== nextDirectory) {
      // If they're equal we're at the root dir
      const candidate = path.join(currentDirectory, 'assets');
      if (fs.existsSync(candidate)) {
        return path.join(currentDirectory, source);
      }

      currentDirectory = nextDirectory;
      nextDirectory = path.join(currentDirectory, '..');
    }
  }

  return source;
};

module.exports = babelJest.createTransformer(babelOptions);
