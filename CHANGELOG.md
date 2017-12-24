# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Updated dependent packages, including Jest from v21 to v22.

## [0.2.0] - 2017-12-23
### Added
- Added in the SkipServerSideRender component that conditionally renders children only if it's client-side. Added in examples/built-in-components to demonstrate it in action. It also is a good example of differential client-server-side components.
- Added in the Jest test framework and some basic tests.
- Added ability to create production builds.

### Changed
- Simplified the Webpack client and server side compilation by using MultiCompiler feature of Webpack.
- Refactored the context piece. Now just a "Cater" object with the options and sides a child objects.

### Fixed
- Wasn't able to supply a custom Layout component from the hosted App. Fixed this and added example/custom-layout to demonstrate.

## [0.1.2] - 2017-12-13
### Added
- Added in the examples/express-server and refactored cater/src to suit plugging in as an http.Handler. A number of files added, but was largely atomizing the old src/server.js into specific middleware components.
