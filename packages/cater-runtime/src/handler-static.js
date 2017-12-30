// Copyright Jon Williams 2017. See LICENSE file.
const fs = require("fs");
const mime = require("mime-types");
const path = require("path");

const MANIFEST_FILENAME = "manifest.json";

/**
 * Basic node-based static file server. In production
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

// We build a whitelist of files to serve - this will be an object with
// keys like the request url `/static/bundle.js` pointing to a small
// object with the full path, mime-type and file size.
const generateFileList = function(publicPath, staticPath, manifest) {
  const manifestEntries = Object.values(manifest).map(v => path.join(publicPath, v));

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
      if (stat.isDirectory()) return directories.push(path.join(currentDirectory, name));

      // Don't serve the manifest file
      if (name === MANIFEST_FILENAME) return;

      // Is it in the manifest?
      const manifestEntry = Object.entries(manifest).find(([k, v]) => path.join(publicPath, v) == publicFile);

      const entry = (files[publicFile] = {
        lastModified: stat.mtime,
        manifest: manifestEntry || false,
        mime: mime.contentType(path.extname(file)),
        size: stat.size, // This means the file can't change after starting...
        path: file
      });

      // Is this a digested file?
      if (entry.manifest) {
        entry.digest = entry.manifest[1].match(/\.([a-f0-9]+)\.[^\.]+/)[1];
      }
    });
  }
  return files;
};

// Create a http.Handler that serves static assets.
const generate = function(publicPath, staticPath, manifest) {
  const files = generateFileList(publicPath, staticPath, manifest);

  return function(req, res, next) {
    // Explict match - we don't traverse the filesystem. Nor do we serve
    // directories.
    let match = files[req.url];

    // No match or an attempt to get the gzip version directly
    if (!match || path.extname(match.path) == ".gz") return next === null ? false : next();

    // Long term caching for digested assets
    if (!!match.digest) {
      res.setHeader("Cache-Control", "max-age=31536000, immutable");
      res.setHeader("ETag", match.digest);
    }
    res.setHeader("Content-Type", match.mime);

    // Check for an ETag match
    const etag = req.headers["if-none-match"];
    if (!!etag && etag !== "*" && etag === match.digest) {
      res.statusCode = 304; // File still matches
      return res.end();
    }

    // Otherwise return the file (or gzip version)
    res.statusCode = 200;

    // Check for statically gzipped versions
    var acceptGzip = (req.headers["accept-encoding"] || "").includes("gzip");
    if (acceptGzip && files[req.url + ".gz"]) {
      match = files[req.url + ".gz"];
      res.setHeader("Content-Encoding", "gzip");
    }
    // If the gzip match was found match now points at the gzip version,
    // not the original. That's why we set headers like mime, prior.

    // Stream either the raw file or the matched gzip version
    res.setHeader("Content-Length", match.size);
    const stream = fs.createReadStream(match.path);
    stream.pipe(res);
  };
};

module.exports = generate;
