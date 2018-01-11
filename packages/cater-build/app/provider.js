// Copyright Jon Williams 2017. See LICENSE file.
import ErrorProvider from './error-provider';
import React from 'react';

/* eslint-disable react/no-danger */

class Provider extends React.Component {
  render() {
    let result = this.props.children;
    if (this.props.dangerouslySetInnerHTML) {
      result = <span dangerouslySetInnerHTML={this.props.dangerouslySetInnerHTML} />;
    }

    /* eslint-disable no-undef */
    if (
      (typeof MODE !== 'undefined' && MODE === 'dev') ||
      (typeof process !== 'undefined' && process.env.CATER_MODE === 'dev')
    ) {
      return (
        <ErrorProvider hot={module.hot} timestamp={new Date()}>
          {result}
        </ErrorProvider>
      );
    }
    return result;
  }
}

export default Provider;
