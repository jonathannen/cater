// Copyright Jon Williams 2017-2018. See LICENSE file.
const cater = require('cater');
const server = require('./server');

const app = cater();
const port = app.httpPort || 3000;

app
  .handler()
  .then((handler) => {
    server.get('*', handler);
    server.listen(port, (err) => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`Express+Cater listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err); // eslint-disable-line no-console
    process.exit(-1);
  });
