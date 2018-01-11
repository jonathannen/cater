// Copyright Jon Williams 2017. See LICENSE file.
import Errors from './cater/errors';
import React from 'react';

class ErrorProvider extends React.Component {
  constructor() {
    super();
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    error.componentStack = info.componentStack; // eslint-disable-line no-param-reassign
    this.setState({ hasError: error });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.hasError !== this.state.hasError) return true;

    if (nextProps.timestamp.getTime() !== this.props.timestamp.getTime()) {
      this.setState({ hasError: false });
      return true;
    }

    return false;
  }

  render() {
    if (this.state.hasError) {
      // Dragons! If the error occurs during hydration, you'll end up with the
      // vestigal server-side rendered code still hanging around. When the
      // error is resolved, it'll re-render from the new anchoring spot --
      // i.e. duplicate the content. This cleans out the old DOM to make
      // sure that doesn't happen.
      setTimeout(() => {
        const node = document.querySelectorAll('[data-reactroot=""]');
        node.forEach((e) => e.parentNode.removeChild(e));
      }, 500);

      return <Errors appRootPath="" error={this.state.hasError} />;
    }
    return this.props.children;
  }
}

export default ErrorProvider;
