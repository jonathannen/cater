// Copyright Jon Williams 2017-2018. See LICENSE file.
import React from 'react';
import { serverContextTypes } from 'server/server-provider';

/**
 * Base component that can be used to write Providers that interact
 * with the Cater Content (server-side only). For an example, take a look
 * at the cater-redux package.
 */
class ContextProvider extends React.Component {
  static contextTypes = serverContextTypes;

  serverContext() {
    return this.context.internalServerContext;
  }

  render() {
    return false;
  }
}

export default ContextProvider;
