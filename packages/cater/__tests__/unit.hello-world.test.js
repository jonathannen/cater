// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';
import HelloWorldApp from './util.hello-world-app';
import { renderToString } from 'react-dom/server';

// The Hello World Unit tests exercise the test framework and make sure
// that the basic functionality (Babel, React) are working as intended.

test('should throw an error if the default App is loaded', () => {
    expect(() => require('./util.default-app')).toThrow();
})

test('is polite and says Hello to the World', () => {
    const output = renderToString(<HelloWorldApp />);
    expect(output).toBe(`<h1 data-reactroot="">Hello World!</h1>`)
});