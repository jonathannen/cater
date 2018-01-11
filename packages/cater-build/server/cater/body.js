// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextComponent from 'server/cater/context-component';
import PropTypes from 'prop-types';
import React from 'react';
import Scripts from 'server/cater/scripts';

/* eslint-disable react/no-danger */

class Body extends ContextComponent {
  static propTypes = {
    unwrap: PropTypes.bool
  };

  static defaultProps = {
    unwrap: false
  };

  render() {
    const ctx = this.caterContext();
    const result = [
      <div key="root" id="root" dangerouslySetInnerHTML={{ __html: ctx.bodyHTML }} />,
      <Scripts key="scripts" />
    ];

    if (this.props.unwrap) return result;
    return <body>{result}</body>;
  }
}

export default Body;
