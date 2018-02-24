// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextConsumer from './context-consumer';

/**
 * A a meta tag in the head element of the document.
 *
 * Typical Usage:
 *
 *    <Meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
 */
// eslint-disable-next-line react/prefer-stateless-function
class Meta extends ContextConsumer {
  render() {
    this.serverContext().addMeta(this.props);
    return false;
  }
}

export default Meta;
