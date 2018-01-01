// Copyright Jon Williams 2017-2018. See LICENSE file.

module.exports = {
  env: {
    production: {
      httpPort: process.env.PORT || 8080, // App Engine supplies via an ENV variable.
    },
  },
};
