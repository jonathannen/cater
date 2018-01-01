// Adapted from https://github.com/reactjs/redux/tree/master/examples
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

/**
 * Counter that can be incremented and decremented.
 */
class Counter extends React.Component {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    counter: PropTypes.number.isRequired
  };

  incrementIfOdd = () => {
    // Arrow function - bound to this
    if (this.props.counter % 2 === 0) return;
    this.props.increment();
  };

  render() {
    return (
      <div>
        <h2>Clicked: {this.props.counter} times</h2>
        <p>
          <button onClick={this.props.increment}>Increment +</button>
        </p>
        <p>
          <button onClick={this.props.decrement}>Decrement -</button>
        </p>
        <p>
          <button onClick={this.incrementIfOdd}>Increment if Odd</button>
        </p>
      </div>
    );
  }
}

const actions = {};
actions.decrement = () => ({ type: DECREMENT_COUNTER });
actions.increment = () => ({ type: INCREMENT_COUNTER });

// Map Props and Actions to Redux
const mapStateToProps = state => ({ counter: state.counter });

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

const ConnectedCounter = connect(mapStateToProps, mapDispatchToProps)(Counter);

export default ConnectedCounter;
