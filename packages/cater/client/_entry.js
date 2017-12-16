// Copyright Jon Williams 2017. See LICENSE file.
import App from 'app/App';
import React from 'react';
import { render } from "react-dom"

// This is the hydrate option, which we'll need to consider at some
// point.
// import { hydrate } from "react-dom"
// hydrate(<App/>, document.getElementById("root"));

/**
 * The _entry.js files are the Webpack 'entry' point for compiling the bundle.
 * The tree of imports from here are used to determine what's in the bundle.
 * In this default case, the project-supplied App component is rendered to
 * the #root <div id='root></div> on the page.
 */

render(<App/>, document.getElementById("root"));