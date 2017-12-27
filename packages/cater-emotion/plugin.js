// const cater = require('cater');

module.exports = function(cater, options) {

  cater.on('configured', () => {
    console.log("configured");
  });

  return true;
}
