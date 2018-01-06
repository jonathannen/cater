const utils = require('loader-utils');
const mime = require('mime-types');

// Tranforms images like cat.png.datauri to an inline data URI string.
// Use with caution with large images.
function loader(source) {
  const options = utils.getOptions(this) || {};
  const sizeWarning = options.sizeWarning || 32 * 1024;

  // Warn the user if the length of the image exceed the warning limit (in bytes)
  if (source.length > sizeWarning) {
    // eslint-disable-next-line no-console
    console.log(`Warning: Importing a very large data URI (${source.length} bytes)`);
  }

  // Get the mime type from the filename in this case
  // cat.dog.hello.png.datauri
  // has it's mime type determined from the "png" portion
  const parts = this.resourcePath.split('.');
  const extension = parts[parts.length - 2];
  const mimetype = mime.contentType(extension);
  const uri = `data:${mimetype};base64,${source.toString('base64')}`;

  return `module.exports = ${JSON.stringify(uri)};`;
}

loader.raw = true;

module.exports = loader;
