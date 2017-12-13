// Copyright Jon Williams 2017. See LICENSE file.
const middleware = require('./middleware');

/**
 * The class shared when cater is used API-level as a library.
 */
class CaterFramework {

    constructor(context) {
        this.context = context;
    }

    // Returns a Promise to the HTTP.Handler for the application
    handler() {
        return middleware(this.context);
    }

    // Runs the development server
    runDevelopmentServer() {
        const http = require('http');

        const options = this.context.options;
        const listen = function(handler) {
            const httpServer = http.createServer(handler);
            httpServer.listen(options.httpPort, (err) => {
                if (err) throw err;
                console.log(`Listening on http://localhost:${options.httpPort}`);
            });  
            return false;      
        }        
        return this.handler().then(listen);
    }

}

export default CaterFramework;