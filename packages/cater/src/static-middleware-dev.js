// Copyright Jon Williams 2017. See LICENSE file.
import fs from "fs";
import mime from "mime-types";
import path from "path";

/**
 * The development version of static-middleware.js. This is less performant
 * and has less controls - but will reload files on changes.
 */
const generate = function(staticPath) {

  return function(req, res, next) {
    const file = path.join(staticPath, req.url);
    if(!fs.existsSync(file)) return next ? next() : false;

    const stat = fs.statSync(file);
    if (stat.isDirectory()) return next ? next() : false;

    const contentType = mime.contentType(path.extname(file));
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stat.size);
    const stream = fs.createReadStream(file);
    stream.pipe(res);
  };
};

export default generate;
