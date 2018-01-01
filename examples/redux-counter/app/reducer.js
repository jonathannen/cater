// Adapted from https://github.com/reactjs/redux/tree/master/examples
import { combineReducers } from 'redux';
import { DECREMENT_COUNTER, INCREMENT_COUNTER } from './counter';

const counter = (state, action) => {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return state + 1;
    case DECREMENT_COUNTER:
      return state - 1;
    default:
      return 0;
  }
};

const rootReducer = combineReducers({ counter });

export default rootReducer;
