// Copyright Jon Williams 2017. See LICENSE file.
const createContext = require('./context');

const app = function(appRootPath = null) {
    const context = createContext(appRootPath);
    require('babel-register')(context.babelOptions);

    const cater = require('./src/index.js');
    const instance = new cater(context);

    configureCli(instance);
    return instance; 
}

app.harness = function() {
    return require('./src/harness.js');
}

const catchFatal = function(err) {
    console.error(err);
    process.exit(-1);
}

// Adds in some useful CLI-level commands to the app
const configureCli = function(app) {
    const commands = app.commands = {}
    
    commands.dev = function() {
        app.runDevelopmentServer().catch(catchFatal);
    }
    return commands;
}

module.exports = app;