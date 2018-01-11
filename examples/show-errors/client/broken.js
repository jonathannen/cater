// Copyright Jon Williams 2017-2018. See LICENSE file.
import React, { Component } from 'react';

/* eslint-disable no-unreachable */

// Comment out the following to get the error
// throw new Error('This error is only generated on the client-side during load.');

class Broken extends Component {
  showAlert = () => {
    window.alert('You did make it!'); // eslint-disable-line no-alert
  };

  render() {
    // throw new Error('This error occurs client-side, but only during render.');
    return (
      <div>
        You will never make it here
        <a tabIndex="0" role="button" onClick={this.showAlert} onKeyPress={this.showAlert}>
          ...
        </a>
      </div>
    );
    // This generates a babel parse error
    // return <div>You will never make it here<p></div>;
  }
}

export default Broken;
