// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';

class Provider extends React.Component {
  render() {
    let { children } = this.props;

    /* eslint-disable no-undef */
    if (
      (typeof MODE !== 'undefined' && MODE === 'dev') ||
      (process && process.env && process.env.CATER_MODE === 'dev')
    ) {
      const script =
        'window.onerror = function() { console.log(arguments); window.errorState = arguments; }';
      children = [
        <script key="script" type="text/javascript" dangerouslySetInnerHTML={{ __html: script }} />
      ].concat(this.props.children);
    }

    return children;
  }
}

export default Provider;
