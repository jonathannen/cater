// Copyright Jon Williams 2017-2018. See LICENSE file.

// Nothing to do. This is purely providing components via the client and server
// components
function plugin(caterApp) {
  caterApp.on('configuring', (app) => {
    app.babel.plugins.push('polished');
  });
}

module.exports = plugin;
