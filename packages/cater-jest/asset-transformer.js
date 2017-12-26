const path = require('path');

module.exports.process = function(src, filename, config, options) {
  const basename = path.basename(filename).replace("'", "\'");
  return `module.exports = '${basename}';`;
}
