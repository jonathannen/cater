// Adapted from https://github.com/reactjs/redux/tree/master/examples
import { combineReducers } from 'redux';

// Sets the initial state as a random number between 0 and 9.
const counter = (state, action) => {
  return Math.floor(Math.random() * 10);
};

const rootReducer = combineReducers({ counter });

export default rootReducer;
