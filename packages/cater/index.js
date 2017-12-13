// Copyright Jon Williams 2017. See LICENSE file.
const createContext = require('./context');

const context = createContext();
const babelOptions = Object.assign({ cache: false}, context.server.babelOptions)
require('babel-register')(babelOptions);

const app = function() {
    const cater = require('./src');
    const instance = new cater(context);
    configureCli(instance);
    return instance; 
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