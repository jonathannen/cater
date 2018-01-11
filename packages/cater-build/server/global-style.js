// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextComponent from 'server/cater/context-component';
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
 *
 * Or for inline styles:
 *
 *     <GlobalStyle css="body { background: tomato }"/>
 */
class GlobalStyle extends ContextComponent {
  static propTypes = {
    css: PropTypes.string,
    href: PropTypes.string
  };

  static defaultProps = {
    css: null,
    href: null
  };

  render() {
    const ctx = this.caterContext();
    if (this.props.href) ctx.addGlobalStyleLink(this.props.href);
    if (this.props.css) ctx.addGlobalStyle(this.props.css);
    return false;
  }
}

export default GlobalStyle;
