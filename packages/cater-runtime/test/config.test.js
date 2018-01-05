// Copyright Jon Williams 2017-2018. See LICENSE file.
import path from 'path';
import { Config } from 'cater-runtime';

const fixturesPath = path.join(__dirname, 'fixtures');

describe('Testing the configuration module of Cater', () => {
  test('should load a configuration file if present', () => {
    const config = Config({ appRootPath: fixturesPath });
    expect(config.httpPort).toEqual(3333);
  });

  test('should use the NODE_ENV environment variable for different configurations', () => {
    // Uses httpPortX instead of httpPort to differeniate from other tests
    const expectPort = function expectPort(port) {
      const config = Config({ appRootPath: fixturesPath });
      expect(config.httpPortX).toEqual(port);
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
afterAll(() => {
  process.env.NODE_ENV = 'test';
  return true;
});
