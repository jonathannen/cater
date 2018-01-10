// Copyright Jon Williams 2017-2018. See LICENSE file.
const clone = require('clone');

/**
 * Composition for the cater-build App class that allows the tracking of errors.
 *
 * Errors currently have two overlapping sources, so it's necessary to track
 * the code path that generated the error. Generally the webpack side is the
 * source of all errors (and error resolution). However it's possible for
 * server-side errors to occur and be resolved without webpack getting involved.
 *
 * The two main users at the webpack and cater handlers. These cover the client
 * and server sides respectively.
 *
 * Typical usage:
 *
 *     try {
 *       ... working code ...
 *       appInstance.triggerResolution('server');
 *     } catch(err) {
 *       appInstance.triggerError('server', err);
 *     }
 */

// Methods intended for composition into the BuildCater class.
function currentErrors() {
  this.errors = this.errors || {};
  return this.errors;
}

function currentErrorList() {
  const errors = this.currentErrors();
  const flattened = Object.values(errors).reduce((a, b) => a.concat(b), []);
  return flattened;
}

function hasErrors() {
  return this.currentErrorList().length > 0;
}

function triggerError(source, error) {
  // eslint-disable-next-line no-console
  console.log(error.stack);
  const current = this.currentErrors();
  current[source] = current[source] || [];
  // Clone as errors still in memory are output at process exit
  current[source].push(clone(error));
}

function triggerErrors(source, errors) {
  // eslint-disable-next-line no-console
  console.log(errors.map((e) => e.stack).join('--------------------\n'));
  const current = this.currentErrors();
  current[source] = current[source] || [];
  // Clone as errors still in memory are output at process exit
  current[source] = current[source].concat(clone(errors));
}

// Resolves any errors for the given sources. If no sources are provided
// then all errors are resolved.
function triggerResolution(...sources) {
  if (!this.hasErrors()) return true;
  this.triggerRetry(...sources);
  return !this.hasErrors();
}

function triggerRetry(...sources) {
  if (!this.hasErrors()) return false; // Flag back there are no errors
  if (sources.length === 0) {
    this.errors = {};
  } else {
    const errors = this.currentErrors();
    sources.forEach((v) => {
      errors[v] = [];
    });
  }
  return true;
}

module.exports = {
  currentErrors,
  currentErrorList,
  hasErrors,
  triggerError,
  triggerErrors,
  triggerResolution,
  triggerRetry
};
