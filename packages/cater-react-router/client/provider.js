// Copyright Jon Williams 2017-2018. See LICENSE file.
import { BrowserRouter } from 'react-router-dom';
import ParentProvider from 'app/^'; // Note: Inheritance import
import React from 'react';

/**
 * Client-side provider for Redux.
 */
class ReduxProvider extends React.Component {
  render() {
    return (
      <ParentProvider>
        <BrowserRouter>{this.props.children}</BrowserRouter>
      </ParentProvider>
    );
  }
}

export default ReduxProvider;
