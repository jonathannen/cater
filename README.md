# Cater &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/facebook/react/blob/master/LICENSE) [![Build Status](https://travis-ci.org/jonathannen/cater.svg?branch=master)](https://travis-ci.org/jonathannen/cater)

Cater is a convention-driven Framework for React and Friends.

Out-of-the-box Cater is configured with the following components:

- Babel 6
- React 16
- Webpack 3
- Jest 21

This library was somewhat inspired from using the [Next.js](https://github.com/zeit/next.js/) Framework. This is an attempt to learn from the ground up, plus take a modular (but convention-driven) approach.

Very much pre-1.0. But feel free to have a poke around. If you want to get an idea, take a look at the "hello-world" package under examples.

Good luck. To get in touch, drop me a line at the author details listed in package.json.

## Plugins

CSS in JS: **emotion**

## Examples

**/examples/hello-world**<br/>
The eponymous introduction application. Hello World is a single App Component that gives the world a friendly "Hello".

**/examples/built-in-components**<br/>
Demonstrates some of the Built-In Cater components.

**/examples/custom-layout**<br/>
A Cater application with it's own customized Layout.

**/examples/express-server**<br/>
By default, Cater in development will launch it's own http.Server. However, you use your own. In this example, we plug Cater in to the Express web framework. Express handles the incoming requests, delegating to the Cater handler.

**/examples/with-emotion**<br/>
Shows Cater being used with the [emotion](https://github.com/emotion-js/emotion) CSS-in-JS framework.