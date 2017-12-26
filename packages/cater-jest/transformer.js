// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const babelJest = require("babel-jest");
const Cater = require("cater");
const fs = require("fs");
const path = require("path");

const cache = {};
const babelOptions = new Cater().sides.server.babel;
delete babelOptions.resolveModuleSource;

babelOptions.resolveModuleSource = function(source, filename) {
  // Asset discovery in test. Find the app directory and funnel from there
  // TODO: Will eventually need this to work in context where the assets
  // are in multiple places. This code also means having the asset location
  // hard-coded.
  if (source.startsWith("assets/")) {
    let currentDirectory = path.basename(filename);
    let nextDirectory = null;
    while (currentDirectory !== nextDirectory) {
      // If they're equal we're at the root dir
      nextDirectory = path.join(currentDirectory, "..");
      let candidate = path.join(currentDirectory, "assets");
      if (fs.existsSync(candidate)) {
        return path.join(currentDirectory, source);
      }
      currentDirectory = nextDirectory;
    }

    return "../" + source;
  }

  return source;
};

module.exports = babelJest.createTransformer(babelOptions);
