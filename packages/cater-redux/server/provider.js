// Copyright Jon Williams 2017-2018. See LICENSE file.
import CustomProvider from 'server/custom-provider';
import { createStore } from 'redux';
import ParentProvider from 'app/^'; // Note: Inheritance import
import { Provider } from 'react-redux';
import React from 'react';

import Reducer from 'app/reducer';

const store = createStore(Reducer);

/**
 * Client-side provider for Redux. Takes the state from the server side
 * and puts it in a global JSON variable - the client provider hyrdates
 * from this data.
 */
class ReduxProvider extends CustomProvider {
  render() {
    const initialState = store.getState();
    this.caterContext().addGlobalJSON('INTERNAL_CATER_REDUX', initialState);

    return (
      <ParentProvider>
        <Provider store={store}>{this.props.children}</Provider>
      </ParentProvider>
    );
  }
}

export default ReduxProvider;
