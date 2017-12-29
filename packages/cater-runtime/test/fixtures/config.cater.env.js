module.exports = {
  httpPort: 3001,

  env: {
    development: {
      httpPort: 3002
    },
    test: {
      httpPort: 3003
    },
    production: {
      httpPort: 8080
    }
  }
};
