// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';
import ParentLayout from 'server/^'; // Note: Inheritance import
import Scripts from 'app/scripts';

/**
 * Custom Layout that extends the CaterLayout.
 */
class Layout extends ParentLayout {
  render() {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <title />
        </head>
        <body>
          <h1>This is a Custom Layout</h1>
          {this.props.children}
          <Scripts />
        </body>
      </html>
    );
  }
}

export default Layout;
