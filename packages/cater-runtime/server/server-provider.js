// Copyright Jon Williams 2017-2018. See LICENSE file.
const PropTypes = require('prop-types');
const React = require('react');

// Context shared by Layout to it's child components
const serverContextTypes = {
  internalServerContext: PropTypes.object
};

/**
 * Provider that enabled Cater-specific functions. Examples are setting
 * Head-level elements from components within the body of the document.
 * Global stylesheets and the document title are two common examples.
 */
class ServerProvider extends React.Component {
  getChildContext() {
    if (!this.childContext) {
      this.childContext = {
        internalServerContext: this.props.context
      };
    }
    return this.childContext;
  }

  render() {
    return this.props.children;
  }
}

ServerProvider.childContextTypes = serverContextTypes;
// eslint-disable-next-line react/forbid-prop-types
ServerProvider.propTypes = { context: PropTypes.object.isRequired };
module.exports = ServerProvider;
module.exports.serverContextTypes = serverContextTypes;
