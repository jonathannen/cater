// Copyright Jon Williams 2017-2018. See LICENSE file.
import App from 'app/app';
import Provider from 'app/provider';
import React from 'react';
import { hydrate } from 'react-dom';

/**
 * The _entry.js files are the Webpack entry point for compiling the bundle.
 * The tree of imports from here are used to determine what's in the bundle.
 * In this default case, the project-supplied App component is rendered to
 * the #root <div id='__CATER_ROOT></div> on the page.
 */
const rootElement = document.getElementById('__CATER_ROOT');
hydrate(
  <Provider>
    <App />
  </Provider>,
  rootElement
);
