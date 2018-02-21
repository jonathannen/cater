// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextConsumer from './context-consumer';

/**
 * Sets the title tag in the head element of the document.
 *
 * Typical Usage:
 *
 *     <Title>Hello Down there!</Title>
 */
class Title extends ContextConsumer {
  render() {
    const { children } = this.props;
    if (typeof this.props.children === 'string') {
      this.serverContext().setTitle(children);
    }
    return false;
  }
}

export default Title;
