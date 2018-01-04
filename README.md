# <p align="center">🍽</p>

# ^ Cater &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/facebook/react/blob/master/LICENSE) [![Build Status](https://travis-ci.org/clashbit/cater.svg?branch=master)](https://travis-ci.org/clashbit/cater)

Hello.

Cater is a convention-driven framework for building Universal applications, using React and Friends.

Out-of-the-box Cater is configured with the following components:

* Babel 6
* Jest 22
* React 16
* Webpack 3

As core components, Cater tends to have a strong opinion on how they're set up. The configuration is augmented and extended by Plugins.

The big thing is to **eliminate as much boilerplate as possible**. If you're writing code for your users rather than your tools, Cater is doing it's job.

Still so much to do. This project is still very much pre-1.0.But feel free to have a poke around. If you want to get a quick idea, take a look at the [hello-world application](https://github.com/clashbit/cater/tree/master/examples/hello-world) and it's peers under [examples](https://github.com/clashbit/cater/tree/master/examples).

Good luck. To get in touch, drop me a line at the author details listed in package.json 🙇‍♂️
.

## Motivation

There are three main motivations behind cater:

* **Micro-Services having First-Class "Micro-Applications"**<br/>Having experience with several Ruby on Rails monoliths, we now want to write platforms as a series focused, contained applications.
* **No Boilerplate**<br/>Lots of focused applications sounds tidy, but generally means lots of boilerplate. Lots of repeated code. Cater's mantra is "no boilerplate". We want focused, contained _straightforward_ applications.
* **Fully Universal Applicatins**<br/>Boilerplate is one complicating issue. Overlap, repetition and competition between the client and server code is another. Cater aims to be a simple way of building and maintaining Universal applications.

This library was somewhat inspired from using the [Next.js](https://github.com/zeit/next.js/) Framework. This is an attempt to learn from the ground up, plus take a modular and convention-driven approach.

## Getting Started (aka "Hello Cater")

The simplest example is hello-world. Note that most of the Cater examples assume the use of the [yarn package manager](https://yarnpkg.com/en/).

In the spirit of no boilerplate, let's get started. First of all, let's create your project directory and add in cater.

    mkdir hello-cater
    cd hello-cater
    yarn init # just accept all the defaults
    yarn add cater
    yarn add --dev cater-build

Not that we have to cater modules. One covers the core and runtime portions. The second is for build-time compilation. That's covered later in this README.

Now let's say hello:

    mkdir app
    touch app/app.js

In that app/app.js file, use your favorite editor to add in the following:

    import React from 'react';
    import Title from 'app/title';
    export default () => (
      <div>
        <Title>Hello Down There!</Title>
        <h1>Hello World! (from Cater)</h1>
      </div>
    );

We're ready to roll. Run:

    yarn run cater dev

Then visit http://localhost:3000/

That's it. You've got a Cater application up and running. For extra credit, quit with CTRL-C and then run:

    yarn run cater build
    NODE_ENV=production yarn run cater start

The first command will build your code into the build directory. The second starts a production-configured server against that build code. Browse to the same location as before. You might not notice, but it's quite a bit snappier than before.

That's the very simple intro. Most of the time you'll want to add the cater commands to the package.json scripts, add tests and the like. You'll find more detailed code in the [examples directory](https://github.com/clashbit/cater/tree/master/examples). This includes a very slightly upgraded version of [this Hello World Example](https://github.com/clashbit/cater/tree/master/examples/hello-world).

## Universal Imports (aka app/\*)

The core Cater piece plugs in to the Babel and Webpack framework to produce differentiated builds for the client and server sides. What does this mean? If you had a directory structure like:

    + app
      - app.js
      - main.js
    + client
      - sidebar.js
    + server
      - sidebar.js
    - package.json

In this trivial example, the App React Component lays out both the Main and Sidebar components. It does this by importing 'app/main' and 'app/sidebar'.

One the client-side, this brings in app/app.js, which resolves to app/main.js and client/sidebar.js. On the server it brings in the same, except the Sidebar resolves to server/sidebar.js. In this way you can create differentiate components depending on the "side" they are on.

For many components this isn't necessary. You just import from app. Or, you can still import './your/regular/file/like/normal'.

However, there are plenty of components where it is necessary. If you take a look at the cater-redux package you'll see Provider Components. On the server side it determines the initial state. On the client side it rehydrates the Redux state.

You can also specify imports like 'server/name' or 'client/name' where you want a specific side to apply.

## Universal Wrappering (aka caret imports)

Another key feature is wrappering. For any import of 'app/my-component' a tree of paths will be searched. This will be a series of paths, which are then searched with the directory "app" and then either the directory "client" or "server", depending on the side. The tree will look something like:

    + <your-current-application>
      - app
      - <client|server>
    + cater-assets
      - app
      - <client|server>
    + cater-build
      - app
      - <client|server>

In the above example, cater-assets is a "plugin", which are described below. Plugins bring in specific features, such as asset compilation, Redux, or CSS-in-JS. The cater-assets plugin happens to be one that is always included by default.

Let's assume the code is running server-side and you wanted to import the Title component from app/title. The code (at build time) would check:

    your-current-application/app/title
    your-current-application/server/title
    cater-assets/app/title
    cater-assets/server/title
    ... and so on.

So it's possible to _override_ the Title component at "cater-build/server/title.js" by putting one at either "your-current-application/app/title.js" or "your-current-application/server/title.js". Whichever is appropriate.

However, sometimes you want to inherit. In this case you want to replace the component, but also get a reference to the origial. For this, you use the caret import. Imports like 'app/^' will return the next component in the search path.

What does that mean? Taking the example of "your-current-application/server/title.js" an import of 'app/^' would return the component _up the path list_, being the Title component in "cater-build/server/title.js". In your own Title component you can then extent or wrapper that original component as you see fit. Like so:

    import ParentTitle from 'app/^'; // ...the mysterious caret import...
    import React from 'react';

    class MyTitle extends React.Component {

        render() {
          return <ParentTitle>I've changed the title!</ParentTitle>
        }
    }

    export default MyTitle;

The Title component is a contrived example, but there are a number of real applications. The simpliest of which is wrappering providers. Each plugin can add a provider that then wrappers the following one. An example of this is the [cater-redux/server/provider.js](https://github.com/clashbit/cater/blob/master/packages/cater-redux/server/provider.js).

This code adds in the Redux Provider and then wrappers it in the parent provider. In this way you can stack providers and other components between your application, plugins and the core Cater code.

## Plugins

So we have Universal Imports and Universal Wrappering. Why? The main reason is to facilitate plugins.

Plugins add in features and libraries like Asset Compilation, Redux, CSS-in-JS, or React Router. Ideally with zero configuration.

Universal Imports allow plugins to provide Universal components. Taking the simple Title component in Hello-Cater above, this component is different for the server and client sides. On the server it sets the &lt;head> &lt;title> element. On the client it uses JavaScript to change _document.title_. Killer.

Univeral Wrapping allows plugins to cascade behavior. The most common case is adding in providers. A CSS-in-JS Theme Provider can wrapper a Redux or React Router Provider without being aware of the specifics of the other plugins.

Let's pick up from the Hello-Cater example at the top of the document. In the same project, run:

     yarn add --dev cater-react-router

Then change the app/app.js file to the following:

    import React from "react";
    import { Link, Route, Switch } from "react-router-dom";

    export default () => (
      <div>
        <p>
          <Link to="/hello">Say Hello</Link> or{" "}
          <Link to="/goodbye">say Goodbye</Link>.
        </p>
        <Switch>
          <Route exact path="/hello"><h1>Hello!</h1></Route>
          <Route exact path="/goodbye"><h1>Goodbye!</h1></Route>
        </Switch>
      </div>
    );

Then run as before:

    yarn run cater dev

Head back to http://localhost:3000 and you'll be able to use the links to click between the Hello and Goodbye routes. Note that the code routes client-side using the "BrowserRouter" react-router component.

That's it. This example is simplified, but can easily be extended to a full application.

## Dev vs. Build. vs. Runtime

Cater has three primary modes:

* **Dev**: which is for development. This is a hot-reloading local version that a developer will typically work against.
* **Build**: which signifies the code is being built for production. Many of the dev-time tools are used, such as Webpack. However, they are configured for production-time execution. For example, built turns on JavaScript minification.
* **Runtime**: is for running the code at production time.

These are related to your familiar NODE_ENV values, but are slightly different. For example, the build spans both development and production configurations. In Cater idiom, dev also resembles what would often be an integration test.

These modes also have very different performance profiles. The Hello-World example above takes (on typical hardware) 2ms to render in dev and the JavaScript bundle is almost 2MB. In production the code those figures are 0.5ms and 32KB (of gzipped, minified JavaScript).

Dev and Build modes are enabled by the cater-build package. That's why we recommend you install cater-build as a development dependency (devDependency). Runtime is enabled by the cater package, which imports cater-runtime.

In this way, you can test and build your application in a full "cater-build" environment and then only deploy the production packages absolutely necessary for runtime.

## Examples

There are a number of projects under the example directory. To highlight some:

**/examples/hello-world**<br/>
The eponymous introduction application. Hello World is a single App Component that gives the world a friendly "Hello".

**/examples/custom-layout**<br/>
A Cater application with it's own customized Layout.

**/examples/emotion**<br/>
Shows Cater being used with the [emotion](https://github.com/emotion-js/emotion) CSS-in-JS framework.

**/examples/express**<br/>
By default, Cater in development will launch it's own http.Server. However, you use your own. In this example, we plug Cater in to the Express web framework. Express handles the incoming requests, delegating to the Cater handler.

**/examples/redux-counter-split**<br/>
Cater with the Redux framework enabled.
