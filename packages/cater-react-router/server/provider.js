// Copyright Jon Williams 2017-2018. See LICENSE file.
import CustomProvider from 'server/custom-provider';
import { StaticRouter } from 'react-router-dom';
import ParentProvider from 'app/^'; // Note: Inheritance import
import React from 'react';

/**
 * Client-side provider for Redux.
 */
class ReduxProvider extends CustomProvider {
  render() {
    const context = {};
    const { url } = this.caterContext();
    return (
      <ParentProvider>
        <StaticRouter location={url} context={context}>
          {this.props.children}
        </StaticRouter>
      </ParentProvider>
    );
  }
}

export default ReduxProvider;
