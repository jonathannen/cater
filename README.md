# Cater &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

Cater is a convention-driven Framework for React and Friends.

At the top level, Cater provides:

- Babel 6
- React 16
- Webpack 3

This library was somewhat inspired from using the [Next.js](https://github.com/zeit/next.js/) Framework. This is an attempt to learn from the ground up, plus take a modular (but convention-driven) approach.

Very much v0.1.1. But feel free to have a poke around. If you want to get an idea, take a look at the "hello-world" package under examples.

Good luck. To get in touch, drop me a line at the author details listed in package.json.

## Examples

    /examples/hello-world
    The eponymous introduction application. Hello World is a single App Component that gives the world a friendly "Hello"

    /examples/express-server
    By default, Cater in development will launch it's own http.Server. However, you use your own. In this example, we plug Cater in to the Express web framework. Express handles the incoming requests, delegating to the Cater handler.
