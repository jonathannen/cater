// Copyright Jon Williams 2017. See LICENSE file.
import { caterContextTypes } from "server/cater-provider";
import PropTypes from "prop-types";
import React from "react";
import Scripts from 'app/scripts';

/**
 * Layout is used on the Server Side to render the HTML surrounding the
 * #root <div id="root"></div> DOM "home" of the application. Any custom
 * layout should extend this component. See examples/custom-layout for
 * more.
 */
class Layout extends React.Component {
  static contextTypes = caterContextTypes;

  render() {
    const ctx = this.context.__caterContext;
    const bundlePath = ctx.bundlePath;
    return (
      <html>
        <head>
          <link rel="preload" href={bundlePath} as="script"/>
          <meta charSet="utf-8" />
          <title />
          {ctx.globalStyles.map(href => <link href={href} key={href} rel="stylesheet" type="text/css" />)}
        </head>
        <body>
          {this.props.children}
          <Scripts />
        </body>
      </html>
    );
  }
}

export default Layout;
