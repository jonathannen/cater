// Copyright Jon Williams 2017. See LICENSE file.
// See ./README.md for why these files exist and what they do.
const path = require('path');

/**
 * Replaces assets with literal strings.
 *
 * For example:
 *
 *     import cat from 'assets/cat.gif';
 *
 * Is transpiled to:
 *
 *     const cat = 'assets/cat.gif';
 */
module.exports.process = function(src, filename, config, options) {
  const basename = path.basename(filename).replace("'", "\'");
  return `module.exports = '${basename}';`;
}
