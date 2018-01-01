// Copyright Jon Williams 2017. See LICENSE file.
const cater = require('cater');
const server = require('./server');

const app = cater();

app
  .handler()
  .then((handler) => {
    server.get('*', handler);
    server.listen((port, err) => {
      if (err) throw err;
      console.log(`Listening at http://localhost:${port}`); // eslint-disable-line no-console
    });
  })
  .catch((err) => {
    console.error(err); // eslint-disable-line no-console
    process.exit(-1);
  });
