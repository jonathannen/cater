// Copyright Jon Williams 2017-2018. See LICENSE file.
const prettyBytes = require('pretty-bytes');

/* eslint-disable no-nested-ternary */
function statusCodeAsTerminalColor(status) {
  // Referenced from https://github.com/expressjs/morgan/blob/master/index.js#L189
  const color =
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
}

/**
 * Basic http.Handler that outputs to the console. Output looks like:
 *      GET /path 200 OK 1.209 ms 343 [343 B]
 *
 * Where the order of values is the HTTP Method, Path, Status Code,
 * Status Description, Render Time (server), Byte Size and [Byte Size Human
 * Readable].
 */
function loggingHandler(req, res, next) {
  const start = process.hrtime();
  const conn = req.connection;
  const bytesWritten = conn.internalBytesWritten === undefined ? 0 : conn.internalBytesWritten;

  res.on('finish', () => {
    const bytes = conn.bytesWritten - bytesWritten;
    conn.internalBytesWritten = conn.bytesWritten;

    const elapsed = process.hrtime(start);
    const elapsedMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000); // prettier-ignore
    const color = statusCodeAsTerminalColor(res.statusCode);
    const gzip = res.getHeaders()['content-encoding'] === 'gzip' ? ' gzipped' : '';

    // eslint-disable-next-line no-console
    console.log(
      `\x1b[0m${req.method} ${req.url} \x1b[${color}m${res.statusCode} ${
        res.statusMessage
      }\x1b[0m ${elapsedMs.toLocaleString()} ms ${bytes} [${prettyBytes(bytes)}${gzip}]`
    );
  });
  return next();
}

// Returns as a function to stay consistent with the other handler-* modules.
module.exports = () => loggingHandler;
