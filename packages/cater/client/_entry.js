// Copyright Jon Williams 2017. See LICENSE file.
import App from 'app/App';
import React from 'react';
import { render } from 'react-dom'

/**
 * The _entry.js files are the Webpack 'entry' point for compiling the bundle.
 * The tree of imports from here are used to determine what's in the bundle.
 * In this default case, the project-supplied App component is rendered to
 * the #root <div id='root></div> on the page.
 */

render(
    <App/>,
    document.getElementById('root')
)