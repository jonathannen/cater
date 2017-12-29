
module.exports = {
  env: {
    production: {
      httpPort: process.env.PORT, // App Engine supplies via an ENV variable.
    }
  }
}
