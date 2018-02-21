// Copyright Jon Williams 2017-2018. See LICENSE file.
import { serverContextTypes } from 'server/server-provider';
import React from 'react';

/**
 * Utility component that hooks into the server-side Cater Context.
 */

class ContextConsumer extends React.Component {
  static contextTypes = serverContextTypes;
  serverContext() {
    return this.context.internalServerContext;
  }
}

export default ContextConsumer;
