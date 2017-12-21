// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const path = require("path");

const INDEX_TEST = "index.test.js";

class CaterRootDirectoryReporter {
  onTestStart(context, results) {
    const testName = context.path;
    const isIndexTest =
      path.basename(testName) == INDEX_TEST ||
      testName.endsWith("." + INDEX_TEST);
    global.rootPath = isIndexTest ? path.dirname(testName) : null;
  }
}

module.exports = CaterRootDirectoryReporter;
