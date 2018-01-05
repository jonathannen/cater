// Copyright Jon Williams 2017-2018. See LICENSE file.
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Server-side of the Memoization component.
 *
 * For more usage instructions, refer to README.md
 */

// Right now this component relies on a simple, in-memory object.
// This won't be suitable for heavy production use.
const cache = {};

class Memoization extends Component {
  static defaultProps = {
    cacheKey: ''
  };

  static propTypes = {
    cacheKey: PropTypes.string
  };

  render() {
    let result = cache[this.props.cacheKey];

    // Cache Miss - render the children
    if (typeof result === 'undefined') {
      result = renderToStaticMarkup(this.props.children);
      cache[this.props.cacheKey] = result;
    }

    return <span dangerouslySetInnerHTML={{ __html: result }} />; // eslint-disable-line react/no-danger
  }
}

export default Memoization;
