// Copyright Jon Williams 2017. See LICENSE file.
const createContext = require("./context");

const app = function(appRootPath = null) {
  const context = createContext(appRootPath);
  require("babel-register")(context.babelOptions);

  const cater = require("./src/index.js");
  const instance = new cater(context);

  return instance;
};

app.createContext = function(appRootPath = null) {
  return createContext(appRootPath);
};

app.harness = function() {
  return require("./src/harness.js");
};

const catchFatal = function(err) {
  console.error(err);
  process.exit(-1);
};

// Adds in some useful CLI-level commands to the app
app.readyCommandLine = function(instance) {
  const commands = (instance.commands = {});

  commands.build = function() {
    instance.build();
  };

  commands.dev = function() {
    instance.runDevelopmentServer().catch(catchFatal);
  };

  commands.start = function() {
    instance.runProductionServer().catch(catchFatal);
  };

  return commands;
};

module.exports = app;
