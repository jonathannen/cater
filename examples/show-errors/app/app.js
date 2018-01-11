// Copyright Jon Williams 2017-2018. See LICENSE file.
import Broken from 'app/broken';
import React from 'react';
import Title from 'app/cater/title';

/* eslint-disable no-unreachable */

// Comment out the following to get the error
// throw new Error('This will cause an error on server start.');

class App extends React.Component {
  render() {
    // throw new Error('This error both client and server-side, but only during render.');
    return (
      <div>
        <Title>Let&apos;s throw some Exceptions!</Title>
        <h1>Good luck!!</h1>
        <Broken />
      </div>
    );
    // This generates a babel parse error
    // return <div>You will never make it here<p></div>;
  }
}

export default App;
