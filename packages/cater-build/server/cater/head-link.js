// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextComponent from 'server/cater/context-component';

/**
 * A a link tag in the head element of the document.
 *
 * Typical Usage:
 *
 * <Link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
 */
// eslint-disable-next-line react/prefer-stateless-function
class HeadLink extends ContextComponent {
  render() {
    this.caterContext().addLink(this.props);
    return false;
  }
}

export default HeadLink;
