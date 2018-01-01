// Copyright Jon Williams 2017-2018. See LICENSE file.
const PropTypes = require('prop-types');
const React = require('react');

// Context shared by Layout to it's child components
const caterContextTypes = {
  __caterContext: PropTypes.object
};

/**
 * Provider that enabled Cater-specific functions. Examples are setting
 * Head-level elements from components within the body of the document.
 * Global stylesheets and the document title are two common examples.
 */
class CaterProvider extends React.Component {
  getChildContext() {
    if (!this.childContext) {
      this.childContext = {
        __caterContext: this.props.caterContext
      };
    }
    return this.childContext;
  }

  render() {
    return this.props.children;
  }
}

// CommonJS
CaterProvider.childContextTypes = caterContextTypes;
CaterProvider.propTypes = { caterContext: PropTypes.object.isRequired };
module.exports = CaterProvider;
module.exports.caterContextTypes = caterContextTypes;
