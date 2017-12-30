// Copyright Jon Williams 2017. See LICENSE file.
import React from "react";
import { caterContextTypes } from "server/cater-provider";
import PropTypes from "prop-types";

/**
 * Sets the title tag in the head element of the document.
 *
 * Typical Usage:
 *
 *     <Title>Hello Down there!</Title>
 */
class Title extends React.Component {
  static contextTypes = caterContextTypes;

  render() {
    if (typeof this.props.children === "string") {
      this.context.__caterContext.setTitle(this.props.children);
    }
    return false;
  }
}

export default Title;
