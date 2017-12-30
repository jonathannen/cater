// Copyright Jon Williams 2017. See LICENSE file.
import { extractCritical } from "emotion-server";
import React from "react";
import { renderToString } from "react-dom/server";
import ParentLayout from "server/^"; // Note: Inheritance import
import Scripts from "app/scripts";

/**
 * Your regular Layout component, but with the emotion styles added in.
 */
class Layout extends ParentLayout {
  render() {
    const appBody = renderToString(this.props.children);
    const { html, ids, css } = extractCritical(appBody);
    const renderedIds = `window.__EMOTION_IDS = ${JSON.stringify(ids)};`;
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title />
          <style dangerouslySetInnerHTML={{ __html: css }} />
        </head>
        <body>
          {this.props.children}
          <script type="text/javascript" dangerouslySetInnerHTML={{ __html: renderedIds }} />
          <Scripts />
        </body>
      </html>
    );
  }
}

export default Layout;
