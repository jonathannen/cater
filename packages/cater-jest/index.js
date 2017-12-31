// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const clone = require("clone");
const path = require("path");

/**
 * Exports as a jest config suitable for testing Cater Applications.
 */

const assetTransformer = path.join(__dirname, "asset-transformer.js");
const emptyModule = path.join(__dirname, "empty-module.js");
const resolver = path.join(__dirname, "resolver.js");
const transformer = path.join(__dirname, "transformer.js");

const assetExtensions = ["jpg", "jpeg", "gif", "png", "svg"];
const assetMatch = `\\.(${assetExtensions.join("|")})$`;

const config = {
  moduleNameMapper: {},
  resolver: resolver,
  transform: { "\\.js$": transformer },
  transformIgnorePatterns: ["\/node_modules\/(?!(cater$|cater-))"]
};

config.transform[assetMatch] = assetTransformer;
config.moduleNameMapper[assetMatch] = emptyModule;

module.exports = function() {
  return clone(config);
};
