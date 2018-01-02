# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2018-01-01

### Added

* Redux is now supported via the cater-redux package.
* Using ESLint across all packages.

### Fixed

* The caret "^ cascade import was traversing component1/app, component2/app, componen1/side, component2/side, ... -- whereas it's now c1/app, c1/side, c2/app, c2/side. This was necessary to get the provider cascade working.

## [0.3.7] - 2017-12-30

### Added

* app/title Title component will set the server and client side title tag in the head of the document.
* The dev server is wrapped in a handler that will ETag development assets invalidating whenever a new compile is triggered. This improves dev-time performance between page loads.
* Production server will now shut down gracefully if two consecutive space keystrokes are received.

## Changed

* Tidied up the emotion test approach in the examples/with-emotion - plus added in hydration for the emotion ids.
* Major refactor of the cater "src" directories to avoid using Babel in runtime. Ongoing, but major improvement.

## [0.3.6] - 2017-12-29

### Added

* A config.cater.js file in the application root directory now is used as options. This can include an "env" section that has options specific for a NODE_ENV.
* Added in a Google Cloud App Engine example. This also necessitated adding in a rudimentary config system to change the HTTP port.
* Static asset server now will set cache headers and check ETags for digested static assets.

## [0.3.2] - 2017-12-28

### Fixed

* Fixing up cross versioning between cater packages and ensuring they're all on the same version.

## [0.3.0] - 2017-12-28

### Added

* The caret import. This will import from a component that overrides another component. For example if you had project/server/layout import '^' it would return the cater/server/layout component. Useful for wrappering.
* Asset processing from the project/asset directory. Supports images, scss and css files. Uses Babel transforms on the server-side and Webpack on the client side.
* Moved to a plugin model that'll allow the base Cater code to be simpler.

### Changed

* Updated dependent packages, including Jest from v21 to v22.
* Moved production components to a cater-runtime package.

## [0.2.0] - 2017-12-23

### Added

* Added in the SkipServerSideRender component that conditionally renders children only if it's client-side. Added in examples/built-in-components to demonstrate it in action. It also is a good example of differential client-server-side components.
* Added in the Jest test framework and some basic tests.
* Added ability to create production builds.

### Changed

* Simplified the Webpack client and server side compilation by using MultiCompiler feature of Webpack.
* Refactored the context piece. Now just a "Cater" object with the options and sides a child objects.

### Fixed

* Wasn't able to supply a custom Layout component from the hosted App. Fixed this and added example/custom-layout to demonstrate.

## [0.1.2] - 2017-12-13

### Added

* Added in the examples/express-server and refactored cater/src to suit plugging in as an http.Handler. A number of files added, but was largely atomizing the old src/server.js into specific middleware components.
