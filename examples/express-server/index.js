// Copyright Jon Williams 2017. See LICENSE file.
const cater = require('cater');
const server = require("./server");

const port = parseInt(process.env.PORT, 10) || 3000;

const app = cater();

app
  .handler()
  .then(handler => {
    server.get("*", handler);
    server.listen(port, err => {
      if (err) throw err;
      console.log(`Listening at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
