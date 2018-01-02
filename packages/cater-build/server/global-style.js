// Copyright Jon Williams 2017-2018. See LICENSE file.
import React from 'react';
import { caterContextTypes } from 'server/cater-provider';
import PropTypes from 'prop-types';

/**
 * Prompts cater to include a global stylesheet for the document.
 * This is only done server-side and in a pass *after* the app is rendered.
 * This is achieved by passing the stylesheet request to the CaterProvider,
 * which is then used to determine the final layout.
 *
 * Multiple stylesheets can be included in a document. However, in many
 * cases it would be better to assemble them in to one stylesheet using
 * a processor like Saas.
 *
 * Typical Usage:
 *
 *     import css from 'assets/my-css-file.scss';
 *     ...
 *     <GlobalStyle href={css}/>
 */
// eslint-disable-next-line react/prefer-stateless-function
class GlobalStyle extends React.Component {
  static contextTypes = caterContextTypes;

  static propTypes = {
    href: PropTypes.string.isRequired
  };

  render() {
    // eslint-disable-next-line no-underscore-dangle
    this.context.internalCaterContext.addGlobalStyle(this.props.href);
    return false;
  }
}

export default GlobalStyle;
