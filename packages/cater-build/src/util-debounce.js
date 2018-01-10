// Copyright Jon Williams 2017-2018. See LICENSE file.

/**
 * Debounces a function. This generator will create a function that if called
 * within a given interval will coalese to a single call.
 *
 * Not that this will also delay the function by the interval. Every call
 * within the interval also resets the clock.
 *
 * The primary use case is for dev time when file changes trigger some action.
 * If multiple files are changed, or the file watcher API is buggy (it is),
 * this can trigger closely-spaced events.
 *
 * Typical Usage:
 *
 *     const debounce = require('./util-debounce'); // Relative Path
 *     function helloWorld() {
 *       console.log('Hello World!');
 *     }
 *     const debouncedHelloWorld = debounce(helloWorld, 1000);
 *     debouncedHelloWorld();
 *     debouncedHelloWorld();
 *     debouncedHelloWorld();
 *
 * Unless you're running on hardware from the 80's, this will produce a single
 * "Hello World".
 *
 * The debounced version also returns a Promise that will resolve to the
 * result of the original passed function.
 *
 * @see https://en.wiktionary.org/wiki/debounce
 */

function generate(fn, interval) {
  let timeout = null;

  return function debouncedFunction() {
    if (timeout) clearTimeout(timeout);
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        try {
          const result = fn();
          return resolve(result);
        } catch (e) {
          return reject(e);
        }
      }, interval);
    });
  };
}

module.exports = generate;
