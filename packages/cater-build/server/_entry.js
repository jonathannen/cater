// Copyright Jon Williams 2017-2018. See LICENSE file.
import App from 'app/app';
import Layout from 'server/layout';
import Provider from 'app/provider';

/**
 * The _entry.js files are the Webpack 'entry' point for compiling the bundle.
 * The tree of imports from here are used to determine what's in the bundle.
 * In the server default case, we want the server Layout and the supplied
 * project App component.
 *
 * We keep here as a separate file to be the top of the bundle. It's also
 * useful as a hot-reloading point for the UI-specific server components.
 */
export default function entry() {
  return { App, Layout, Provider };
}
