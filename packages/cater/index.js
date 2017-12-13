// Copyright Jon Williams 2017. See LICENSE file.
const http = require('http');
const createContext = require('./context');

// Set up a context for the application and configure Babel transpiler.
const context = createContext();
require('babel-register')(context.server.babelOptions);

// Runs the development server
const dev = function() {
    const port = context.options.httpPort;
    const server = require('./src/server');

    var ready = server.default(context);
    ready.then((handler) => {
        const httpServer = http.createServer(handler);
        httpServer.listen(port, (err) => {
            if (err) throw err;
            console.log(`Listening on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
        process.exit(-1);
    });
    return true;
}

module.exports.context = context;
module.exports.dev = dev;