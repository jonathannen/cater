const path = require("path");

class CaterRootDirectoryReporter {
  
  onTestStart(context, results) {
    if (context.path.endsWith("index.test.js")) {
      global.rootDir = path.dirname(context.path);
    } else {
      global.rootDir = null;
    }
  }
  
}

module.exports = CaterRootDirectoryReporter;
