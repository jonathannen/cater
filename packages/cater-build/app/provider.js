// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';

class Provider extends React.Component {
  render() {
    if (this.props.dangerouslySetInnerHTML) {
      return <div dangerouslySetInnerHTML={this.props.dangerouslySetInnerHTML} />;
    }
    return <div>{this.props.children}</div>;
  }
}

export default Provider;
