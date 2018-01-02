// Copyright Jon Williams 2017-2018. See LICENSE file.
import { createStore } from 'redux';
import ParentProvider from 'app/^'; // Note: Inheritance import
import { Provider } from 'react-redux';
import React from 'react';

import Reducer from 'app/reducer';

// Get the initial state from the global JSON
const initialState = window.INTERNAL_CATER_REDUX;
const store = createStore(Reducer, initialState);

/**
 * Client-side provider for Redux.
 */
class ReduxProvider extends React.Component {
  render() {
    return (
      <ParentProvider>
        <Provider store={store}>{this.props.children}</Provider>
      </ParentProvider>
    );
  }
}

export default ReduxProvider;
