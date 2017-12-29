// Copyright Jon Williams 2017. See LICENSE file.
import React from "react";

// Since this is the client implementation of this component, it renders
// all the children.
class SkipServerSideRender extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  componentDidMount() {
    this.setState({ visible: true });
  }

  render() {
    return this.state.visible ? this.props.children : false;
  }
}

export default SkipServerSideRender;
