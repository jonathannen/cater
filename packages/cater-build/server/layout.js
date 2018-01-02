// Copyright Jon Williams 2017-2018. See LICENSE file.
import { caterContextTypes } from 'server/cater-provider';
import React from 'react';
import Scripts from 'app/scripts';

/**
 * Layout is used on the Server Side to render the HTML surrounding the
 * #root <div id="root"></div> DOM "home" of the application. Any custom
 * layout should extend this component. See examples/custom-layout for
 * more.
 */
// eslint-disable-next-line react/prefer-stateless-function
class Layout extends React.Component {
  static contextTypes = caterContextTypes;

  render() {
    // eslint-disable-next-line react/prop-types
    const { children } = this.props;
    // eslint-disable-next-line no-underscore-dangle
    const ctx = this.context.internalCaterContext;

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <link rel="preload" href={ctx.bundlePath} as="script" />
          <title>{ctx.title}</title>
          {ctx.globalStyles.map((href) => (
            <link href={href} key={href} rel="stylesheet" type="text/css" />
          ))}
        </head>
        <body>
          {children}
          <Scripts />
        </body>
      </html>
    );
  }
}

export default Layout;
