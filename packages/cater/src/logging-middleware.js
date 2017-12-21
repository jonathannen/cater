// Copyright Jon Williams 2017. See LICENSE file.
import prettyBytes from "pretty-bytes";

const statusCodeAsTerminalColor = function(status) {
  // Referenced from https://github.com/expressjs/morgan/blob/master/index.js#L189
  var color =
    status >= 500
      ? 31 // red
      : status >= 400
        ? 33 // yellow
        : status >= 300
          ? 36 // cyan
          : status >= 200
            ? 32 // green
            : 0; // no color
  return color;
};

/**
 * Basic middleware that outputs to the console. Output looks like:
 *      GET /path 200 OK 1.209 ms 343 [343 B]
 *
 * Where the order of values is the HTTP Method, Path, Status Code,
 * Status Description, Render Time (server), Byte Size and [Byte Size Human
 * Readable].
 */
const loggingMiddleware = function(req, res, next) {
  const start = process.hrtime();
  const conn = req.connection;
  const bytesWritten =
    conn._bytesWritten === undefined ? 0 : conn._bytesWritten;

  res.on("finish", () => {
    const bytes = conn.bytesWritten - bytesWritten;
    conn._bytesWritten = conn.bytesWritten;

    const elapsed = process.hrtime(start);
    const elapsedMs = elapsed[0] * 1000 + elapsed[1] / 1000000;
    const color = statusCodeAsTerminalColor(res.statusCode);
    const gzip =
      res.getHeaders()["content-encoding"] === "gzip" ? " gzipped" : "";

    console.log(
      `\x1b[0m${req.method} ${req.url} \x1b[${color}m${res.statusCode} ${
        res.statusMessage
      }\x1b[0m ${elapsedMs.toLocaleString()} ms ${bytes} [${prettyBytes(
        bytes
      )}${gzip}]`
    );
  });
  return next();
};

export default loggingMiddleware;
