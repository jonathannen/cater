const path = require('path');

module.exports = {

    help: 'See the examples directory at https://github.com/jonathannen/cater',
    reporter: path.join(__dirname, 'reporter.js'),
    resolver: path.join(__dirname, 'resolver.js'),
    transformer: path.join(__dirname, 'transformer.js'),
    
}