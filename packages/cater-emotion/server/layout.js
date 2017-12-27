// Copyright Jon Williams 2017. See LICENSE file.
import ParentLayout, { Body, Scripts } from "server/^";
import React from "react";
import { extractCritical } from "emotion-server";
import { renderToString } from "react-dom/server";

/**
 * Your regular Layout component, but with the emotion styles added in.
 */
class Layout extends ParentLayout {
  render() {
    const App = this.props.app;
    const appBody = renderToString(<App />);
    const { html, ids, css } = extractCritical(appBody);
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title />
          <style dangerouslySetInnerHTML={{ __html: css }} />
        </head>
        <body>
          <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
          <Scripts />
        </body>
      </html>
    );
  }
}

export default Layout;
