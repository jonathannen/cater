// Copyright Jon Williams 2017. See LICENSE file.
const fs = require('fs');
const mime = require('mime-types')
const path = require('path')

const MANIFEST_FILENAME = 'manifest.json';

/**
 * Very basic, but reasonable node-based static file server. In production
 * we'd expect a server like NGINX would be used to deliver static files.
 * However, this can be useful for production-like and situations where
 * a separate http server doesn't make sense.
 *
 * The static server will generally deliver files from the build static files
 * directory. This is configurable but will be <project>/build/static by
 * default.
 *
 * At statup the server makes a list of all the files under that directory
 * and indexes them according to the expected request. To load new files
 * you'll need to restart the server.
 *
 * Doesn't currently handle headers like caching - that's on the list.
 */

const generate = function(publicPath, staticPath) {
  // We build a whitelist of files to serve - this will be an object with
  // keys like the request url `/static/bundle.js` pointing to a small
  // object with the full path, mime-type and file size.
  const files = {};
  const directories = ["."];
  while (directories.length > 0) {
    const currentDirectory = directories.shift();
    const currentPath = path.join(staticPath, currentDirectory);

    fs.readdirSync(currentPath).forEach(name => {
      const file = path.join(currentPath, name);
      const publicFile = path.join(publicPath, currentDirectory, name);
      const stat = fs.statSync(file);

      // Don't follow symlinks or anything else
      if (fs.realpathSync(file) !== file) return;

      // Directories get added to the queue to process
      if (stat.isDirectory())
        return directories.push(path.join(currentDirectory, name));

      // Don't serve the manifest file
      if(name === MANIFEST_FILENAME) return;

      files[publicFile] = {
        path: file,
        mime: mime.contentType(path.extname(file)),
        size: stat.size // This means the file can't change after starting...
      };
    });
  }

  return function(req, res, next) {
    // Explict match - we don't traverse the filesystem. Nor do we serve
    // directories.
    let match = files[req.url];

    if (!match || path.extname(match.path) == ".gz")
      return next === null ? false : next();

    res.statusCode = 200;
    res.setHeader("Content-Type", match.mime);

    // Check for statically gzipped versions
    var acceptGzip = (req.headers["accept-encoding"] || "").includes("gzip");
    if (acceptGzip && files[req.url + ".gz"]) {
      match = files[req.url + ".gz"];
      res.setHeader("Content-Encoding", "gzip");
    }

    // Stream either the raw file or the matched gzip version
    res.setHeader("Content-Length", match.size);
    const stream = fs.createReadStream(match.path);
    stream.pipe(res);
  };
};

module.exports = generate;
