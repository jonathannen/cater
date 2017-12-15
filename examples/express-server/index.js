// Copyright Jon Williams 2017. See LICENSE file.
const cater = require('cater')
const express = require('express')

const port = parseInt(process.env.PORT, 10) || 3000
const app = cater();
const server = express();

// The Cater "app" is a parcel of all the different parts of a Cater-based
// Application. The handler returns a Promise that can be used by most
// http.Handler based frameworks. Following is an example using express.

// Add in some other routes, to make it interesting
server.get('/express', (req, res) => { 
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('This page is rendered directly in Express.'); 
})

app.handler()
    .then((handler) => {

        server.get('*', handler);
        server.listen(port, (err) => {
            if (err) throw err
            console.log(`Listening at http://localhost:${port}`)
        })
    })
    .catch((err) => {
        console.error(err);
        process.exit(-1);
    })
