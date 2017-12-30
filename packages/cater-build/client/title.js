// Copyright Jon Williams 2017. See LICENSE file.
import React from "react";
import PropTypes from "prop-types";

/**
 * Sets the title tag in the head element of the document. See the server
 * equivalent cater-build/server/title.js for usage information.
 */
class Title extends React.Component {

  componentDidMount() {
    // Most of the time this won't be true, but it's possible the
    // server has a "loading.." or similar text that differs on client load.
    if(document.title !== this.props.children) {
      document.title = this.props.children;
    }
  }

  render() {
    return false;
  }
}

export default Title;
