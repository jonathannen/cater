// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextComponent from 'server/cater/context-component';

/**
 * Sets the title tag in the head element of the document.
 *
 * Typical Usage:
 *
 *     <Title>Hello Down there!</Title>
 */
// eslint-disable-next-line react/prefer-stateless-function
class Title extends ContextComponent {
  render() {
    // eslint-disable-next-line react/prop-types
    const { children } = this.props;
    if (typeof this.props.children === 'string') {
      // eslint-disable-next-line no-underscore-dangle
      this.caterContext().setTitle(children);
    }
    return false;
  }
}

export default Title;
