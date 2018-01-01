// Copyright Jon Williams 2017-2018. See LICENSE file.

import path from 'path';
import RuntimeCater from 'cater-runtime';

const fixturesPath = path.join(__dirname, 'fixtures');

describe('Testing the configuration module of Cater', () => {
  test('should load a configuration file if present', () => {
    let file = path.join(fixturesPath, 'config.cater.simple.js');
    let options = RuntimeCater.loadConfig(file);
    expect(options.httpPort).toEqual(8080);
  });

  test('should use the NODE_ENV environment variable for different configurations', () => {
    const file = path.join(fixturesPath, 'config.cater.env.js');

    const expectPort = function(port) {
      let options = RuntimeCater.loadConfig(file);
      expect(options.httpPort).toEqual(port);
    };

    process.env.NODE_ENV = 'development';
    expectPort(3002);

    process.env.NODE_ENV = 'test';
    expectPort(3003);

    process.env.NODE_ENV = 'production';
    expectPort(8080);
  });
});

// Make sure we're not leaving the NODE_ENV at a strange value
afterAll(() => (process.env.NODE_ENV = 'test'));
