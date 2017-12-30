// const test = require("cater-jest");

// // throw "!";
// module.exports = test.jestConfig();
const config = require("cater-jest")();

config["projects"] = ["<rootDir>"] //, "./examples/*"]

module.exports = config;
