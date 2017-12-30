// Copyright Jon Williams 2017. See LICENSE file.

module.exports = {
  env: {
    production: {
      httpPort: process.env.PORT, // App Engine supplies via an ENV variable.
    }
  }
}
