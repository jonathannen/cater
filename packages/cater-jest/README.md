# Cater-Jest

Cater-Jest contains utilities for testing with the [Jest](https://facebook.github.io/jest/) framework.

These files are mostly workarounds to enable App-like testing within Jest. For example, the [Cater Workspace Package](https://github.com/jonathannen/cater/blob/master/package.json) will test all of the Cater Packages, plus all the Examples.

## Usage

Typically add a jest.config.js file with the following to your project:

    module.exports = require("cater-jest")();

This brings in all the necessary components to run jest tests. See the examples directory for more.
