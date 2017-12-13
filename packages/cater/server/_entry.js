// Copyright Jon Williams 2017. See LICENSE file.
import Layout from './Layout';
import App from 'app/App'

/**
 * The _entry.js files are the Webpack 'entry' point for compiling the bundle.
 * The tree of imports from here are used to determine what's in the bundle.
 * In the server default case, we want the server Layout and the supplied
 * project App component.
 * 
 * We keep here as a separate file to be the top of the bundle. It's also
 * useful as a hot-reloading point for the UI-specific server components.
 */

const components = function() {
    return { App, Layout };
}

export default components;