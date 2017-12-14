// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';

class SkipServerSideRender extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      isClientSide: false
    };
  }

  componentDidMount() {
    this.setState({isClientSide: true});
  }

    // const { children, onSSR = <DefaultOnSSR />} = this.props;
    // const { canRender } = this.state;

    // return canRender ? children : onSSR;
  render() {
      if()
      return <h3>Fooled You</h3>
  }
}

export default SkipServerSideRender;