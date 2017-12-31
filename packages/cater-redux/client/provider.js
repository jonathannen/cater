// Copyright Jon Williams 2017. See LICENSE file.
import { createStore } from "redux";
import ParentProvider from 'app/^'; // Note: Inheritance import
import { Provider } from "react-redux";
import React from 'react';

import Reducer from 'app/reducer';

const store = createStore(Reducer);

/**
 * Client-side provider for Redux.
 */
class ReduxProvider extends React.Component {

  render() {
    return (
      <ParentProvider><Provider store={store}>{this.props.children}</Provider></ParentProvider>
    );
  }
}

export default ReduxProvider;
