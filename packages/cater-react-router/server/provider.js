// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextProvider from 'server/cater/context-provider';
import { StaticRouter } from 'react-router-dom';
import ParentProvider from 'app/^'; // Note: Inheritance import
import React from 'react';

/**
 * Client-side provider for Redux.
 */
class ReduxProvider extends ContextProvider {
  render() {
    const context = {};
    const { url } = this.serverContext();
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
