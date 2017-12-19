// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';

// Since this is the client implementation of this component, it renders
// all the children.
class SkipServerSideRender extends React.Component {

    render() {
        return this.props.children;
    }

}

export default SkipServerSideRender;