# Cater Emotion

Enables the [Redux](https://redux.js.org/) library.

This library expects to load the reducer from _reducer.js_ in your application. If you have multiple reducers, use the [combineReducers](https://redux.js.org/docs/recipes/reducers/UsingCombineReducers.html) function that comes with Redux.

The [examples/redux-counter](https://github.com/clashbit/cater/tree/master/examples/react-router) has a common reducer under [app/reducer.js](https://github.com/clashbit/cater/blob/master/examples/redux-counter/app/reducer.js).

The [examples/redux-counter-split](https://github.com/clashbit/cater/tree/master/examples/redux-counter-split) example has different reducers for the [client](https://github.com/clashbit/cater/blob/master/examples/redux-counter-split/client/reducer.js) and [server](https://github.com/clashbit/cater/blob/master/examples/redux-counter-split/server/reducer.js) sides.
