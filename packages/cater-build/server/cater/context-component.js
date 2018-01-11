// Copyright Jon Williams 2017-2018. See LICENSE file.
import { caterContextTypes } from 'server/cater-provider';
import React from 'react';

/**
 * Utility component that hooks into the server-side Cater Context.
 */

class ContextComponent extends React.Component {
  static contextTypes = caterContextTypes;
  caterContext() {
    return this.context.internalCaterContext;
  }
}
export default ContextComponent;
