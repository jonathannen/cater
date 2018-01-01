// Copyright Jon Williams 2017-2018. See LICENSE file.
import React from 'react';
import { caterContextTypes } from 'server/cater-provider';
import PropTypes from 'prop-types';

/**
 * Base component that can be used to write Providers that interact
 * with the Cater Content (server-side only). For an example, take a look
 * at the cater-redux package.
 */
class CustomProvider extends React.Component {
  static contextTypes = caterContextTypes;

  caterContext() {
    return this.context.__caterContext;
  }

  render() {
    return false;
  }
}

export default CustomProvider;
