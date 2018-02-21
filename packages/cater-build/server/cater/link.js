// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextConsumer from './context-consumer';

/**
 * A a link tag in the head element of the document.
 *
 * Typical Usage:
 *
 *    <Link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"/>
 *
 * If the use of the "Link" component name collides with other components,
 * import using a unique name. For example:
 *
 *    import HeadLink from 'app/cater/link';
 *    <HeadLink href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"/>
 */
// eslint-disable-next-line react/prefer-stateless-function
class Link extends ContextConsumer {
  render() {
    this.serverContext().addLink(this.props);
    return false;
  }
}

export default Link;
