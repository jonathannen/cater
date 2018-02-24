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
    let file = null;

    // Escape hatches for hardcoded standard like favicon.ico and robots.txt
    switch (req.url) {
      case '/favicon.ico':
        file = path.join(process.cwd(), 'assets', 'favicon', 'favicon.ico');
        break;

      case '/robots.txt':
        file = path.join(staticPath, 'robots.txt');
        break;

      // ... Otherwise, check for the file in the static directory as usual
      default:
        if (!req.url.startsWith(publicPath)) return next ? next() : false;
        file = path.join(staticPath, req.url.slice(publicPath.length));
    }

    // See if the file exists and make sure it's a regular file
    if (!fs.existsSync(file)) return next ? next() : false;
    const stat = fs.statSync(file);
    if (!stat.isFile()) return next ? next() : false;

    // All set. Serve it up.
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
