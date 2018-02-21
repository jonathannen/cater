// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextConsumer from './context-consumer';
import PropTypes from 'prop-types';
import React from 'react';
import Scripts from 'server/cater/scripts';

/* eslint-disable react/no-danger */

class Body extends ContextConsumer {
  static propTypes = {
    unwrap: PropTypes.bool
  };

  static defaultProps = {
    unwrap: false
  };

  render() {
    const ctx = this.serverContext();
    const result = [
      <div key="root" id="root" dangerouslySetInnerHTML={{ __html: ctx.bodyHTML }} />,
      <Scripts key="scripts" />
    ];

    if (this.props.unwrap) return result;
    return <body>{result}</body>;
  }
}

export default Body;
