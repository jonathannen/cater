// Copyright Jon Williams 2017-2018. See LICENSE file.
import { extractCritical } from 'emotion-server';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ParentLayout from 'server/^'; // Note: Inheritance import
import Scripts from 'app/scripts';

/* eslint-disable react/no-danger */

/**
 * Your regular Layout component, but with the emotion styles added in.
 */
class Layout extends ParentLayout {
  render() {
    const appBody = renderToString(this.props.children);
    const { html, ids, css } = extractCritical(appBody);
    const renderedIds = `window.EMOTION_IDS = ${JSON.stringify(ids)};`;
    return (
      <html lang="en">
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
