// Copyright Jon Williams 2017-2018. See LICENSE file.
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');

/**
 * The development version of static-middleware.js. This is less performant
 * and has less controls - but will reload files on changes.
 */
function generate(publicPath, staticPath) {
  return function handler(req, res, next) {
    if (!req.url.startsWith(publicPath)) return next ? next() : false;

    const trimmed = req.url.slice(publicPath.length);
    const file = path.join(staticPath, trimmed);
    if (!fs.existsSync(file)) return next ? next() : false;

    const stat = fs.statSync(file);
    if (stat.isDirectory()) return next ? next() : false;

    const contentType = mime.contentType(path.extname(file));
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);
    const stream = fs.createReadStream(file);
    stream.pipe(res);
    return true;
  };
}

module.exports = generate;
