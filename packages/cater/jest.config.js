// const test = require("cater-jest");

// // throw "!";
// module.exports = test.jestConfig();
const config = require("cater-jest")();

config["projects"] = ["<rootDir>", "<rootDir>/integration/*"];
config["testPathIgnorePatterns"]  = ["/integration/", "/node_modules/"];

module.exports = config;
