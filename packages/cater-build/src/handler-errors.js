// Copyright Jon Williams 2017-2018. See LICENSE file.
const Convert = require('ansi-to-html');
const ErrorsComponent = require('../app/cater/errors');
const escape = require('html-escape');
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const suggest = require('./util-errors');

/* eslint-disable no-param-reassign */

const CALLSITE_PROPERTIES = [
  'getTypeName',
  'getFunction',
  'getFunctionName',
  'getMethodName',
  'getFileName',
  'getLineNumber',
  'getColumnNumber',
  'getEvalOrigin',
  'isToplevel',
  'isEval',
  'isNative',
  'isConstructor'
];

function createFrameFromCallsite(callsite, index) {
  const frame = {};
  CALLSITE_PROPERTIES.forEach((v) => {
    const name = v.replace(/^(get|is)/, '');
    frame[name[0].toLowerCase() + name.slice(1)] = callsite[v]();
    frame.depth = index;
  });
  return frame;
}

const { prepareStackTrace } = Error;
Error.prepareStackTrace = function captureCallsites(err, callsites) {
  err.trace = callsites.map(createFrameFromCallsite); // eslint-disable-line no-param-reassign
  return prepareStackTrace(err, callsites);
};

function renderError(appRootPath, providedError) {
  // Convert the message which may be Terminal ANSI to HTML
  const convert = new Convert();

  // Turtles all the way down. If error.error is set, this is likely a
  // wrapped webpack error. Drill down to the final error.
  let error = providedError;
  while (error.error) error = error.error; // eslint-disable-line prefer-destructuring

  // Terminal ANSI color messages get converted to HTML
  ['message', 'codeFrame'].filter((v) => error[v]).forEach((v) => {
    error[`${v}HTML`] = convert.toHtml(escape(error[v]).replace(/[\n\r]+/g, '<br/>'));
  });
  error.suggestion = suggest(error);

  const errors = createElement(ErrorsComponent, { appRootPath, error }, null);
  const body = renderToString(errors);
  return body;
}

function respondWithError(req, res, appRootPath, error) {
  if (res.finished) return false; // Boundary check if the response has actually been sent
  const { message } = error;

  // eslint-disable-next-line no-control-regex
  const title = escape((message || '').split(/[\n\r]+/)[0].replace(/\x1b\[[/d]*m/, ''));

  // <!DOCTYPE html>
  res.statusCode = 500;
  res.write(
    `<html lang='en'><head><meta charset="utf-8"><title>Error: ${title}</title></head><body class='cater-error'>`
  );
  res.write(renderError(appRootPath, error));
  res.write('</body></html>');
  res.end();
  return false;
}

/**
 * Basic http.Handler that captures errors.
 *
 * TODO: Modify this to render multiple errors.
 */
function generate(app) {
  return function errorsHandler(req, res, next = null) {
    if (app.hasErrors()) {
      return respondWithError(req, res, app.appRootPath, app.currentErrorList()[0]);
    }

    try {
      next();
      return true;
    } catch (error) {
      console.error(error.stack); // eslint-disable-line no-console
      return respondWithError(req, res, app.appRootPath, error);
    }
  };
}

module.exports = generate;
