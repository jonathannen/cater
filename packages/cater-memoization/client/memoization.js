// Copyright Jon Williams 2017-2018. See LICENSE file.
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Client-side of the Memoization component. This will render the children
 * as normal - including any action hooks.
 *
 * For more usage instructions, refer to README.md
 */
class Memoization extends Component {
  static defaultProps = {
    cacheKey: ''
  };

  static propTypes = {
    cacheKey: PropTypes.string // eslint-disable-line react/no-unused-prop-types
  };

  render() {
    return <span>{this.props.children}</span>;
  }
}

export default Memoization;
