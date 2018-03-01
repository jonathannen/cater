// Copyright Jon Williams 2017-2018. See LICENSE file.
// Note ES2015 imports:
import cater from '../index.js';
import fs from 'fs';
import handlerCater from './handler-cater';
import path from 'path';
import { Middleware } from 'cater-runtime';

if (!global.INTERNAL_POLYFILL) {
  global.INTERNAL_POLYFILL = !!require('babel-polyfill'); // eslint-disable-line global-require
}

export function testCater(options = {}) {
  const app = cater(options);
  return app;
}

function calculateTestRootDirectory() {
  let dir = path.dirname(global.jasmine.testPath);

  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    const next = path.join(dir, '..');
    if (dir === next) return process.cwd(); // Hit the root directory
    dir = next;
  }

  return dir;
}

/**
 * Returns a http.Handler that can be used in tests.
 */
export function testHandler(appRootPath = null) {
  let root = appRootPath;

  if (!appRootPath && global.jasmine && global.jasmine.testPath) {
    root = calculateTestRootDirectory();
  }

  const app = testCater({ appRootPath: root || process.cwd() });

  const handler = handlerCater(app);
  handler.load();
  const errorHandler = () => {
    throw new Error('Request not handled.');
  };

  return Middleware([handler, errorHandler]);
}
