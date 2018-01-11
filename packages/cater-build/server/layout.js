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

class Layout extends React.Component {
  static contextTypes = caterContextTypes;

  render() {
    const { children } = this.props;
    const ctx = this.context.internalCaterContext;

    let css = '';
    if (ctx.globalStyles) {
      const joinedCss = ctx.globalStyles.join('\n');
      css = <style dangerouslySetInnerHTML={{ __html: joinedCss }} />;
    }

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <link rel="preload" href={ctx.bundlePath} as="script" />
          <title>{ctx.title}</title>
          {ctx.globalStyleLinks.map((href) => (
            <link href={href} key={href} rel="stylesheet" type="text/css" />
          ))}
          {css}
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
