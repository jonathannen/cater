// Copyright Jon Williams 2017. See LICENSE file.
import PropTypes from "prop-types";
import React from "react";

// Context shared by Layout to it's child components
export const caterContextTypes = {
  __caterContext: PropTypes.object,
};

/**
 * Provider that enabled Cater-specific functions. Examples are setting
 * Head-level elements from components within the body of the document.
 * Global stylesheets and the document title are two common examples.
 */
class CaterProvider extends React.Component {
  static childContextTypes = caterContextTypes;

  static propTypes = {
    caterContext: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      __caterContext: this.props.caterContext,
    };
  }

  render() {
    return this.props.children;
  }
}

export default CaterProvider;
