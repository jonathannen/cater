// Copyright Jon Williams 2017-2018. See LICENSE file.
import App from 'app/app';
import Provider from 'app/provider';
import React from 'react';
import { hydrate } from 'react-dom';

/**
 * The _entry.js files are the Webpack entry point for compiling the bundle.
 * The tree of imports from here are used to determine what's in the bundle.
 * In this default case, the project-supplied App component is rendered to
 * the #root <div id='root'></div> on the page.
 */

// Plug into Hot Module Replacement, if it's available
if (module.hot) module.hot.accept(App);

// Hydrate the React app against the root element
const rootElement = document.getElementById('root');
hydrate(
  <Provider>
    <App />
  </Provider>,
  rootElement
);
