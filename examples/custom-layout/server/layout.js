// Copyright Jon Williams 2017. See LICENSE file.
import PropTypes from "prop-types";
import React, { Component } from "react";
import ParentLayout, { Body, Scripts } from "server/^";

/**
 * Custom Layout that extends the CaterLayout.
 */
class Layout extends ParentLayout {
  render() {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title />
        </head>
        <body>
          <h1>This is a Custom Layout</h1>
          <Body />
          <Scripts />
        </body>
      </html>
    );
  }
}

export default Layout;
