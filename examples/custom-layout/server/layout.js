// Copyright Jon Williams 2017-2018. See LICENSE file.
import Body from 'server/cater/body';
import Head from 'server/cater/head';
import React from 'react';
import ParentLayout from 'server/^'; // Note: Inheritance import

/**
 * Custom Layout that extends the CaterLayout.
 */
class Layout extends ParentLayout {
  render() {
    return (
      <html lang="en">
        <Head />
        <body>
          <h1>This is a Custom Layout</h1>
          <Body unwrap />
        </body>
      </html>
    );
  }
}

export default Layout;
