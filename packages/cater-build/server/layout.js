// Copyright Jon Williams 2017-2018. See LICENSE file.
import Body from 'server/cater/body';
import Head from 'server/cater/head';
import React, { Component } from 'react';

/**
 * Layout is used on the Server Side to render the HTML surrounding the
 * #root <div id="root"></div> DOM "home" of the application. Any custom
 * layout should extend this component. See examples/custom-layout for
 * more.
 */

class Layout extends Component {
  render() {
    return (
      <html lang="en">
        <Head />
        <Body />
      </html>
    );
  }
}

export default Layout;
