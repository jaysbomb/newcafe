'use strict';

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    // development configuration
    development: {
        db: 'mongodb://admin:admin@ds151927.mlab.com:51927/heroku_w0m1dj5t',
        root: rootPath,
        app: {
            name: 'wom | Development',
            host: 'http://localhost',
            port: 1337
        }
    },
    // production configuration
    production: {
        db: 'mongodb://admin:admin@ds151927.mlab.com:51927/heroku_w0m1dj5t',
        root: rootPath,
        app: {
            name: 'wom',
            host: 'http://localhost',
            port: 80
        }
    }
};
