# Cater Memoization

Provides [Memoization](https://en.wikipedia.org/wiki/Memoization) for Universal components in React.

This library is intended to be used as a Plugin for the [Cater Framework](www.caterjs.com), but the components could be used with other Universal applications.

This plugin simply stores the result of a render on the server-side against a cacheKey. Right now this is directly into a Plain-Old-JavaScript-Object. This will work in contained circumstances, but isn't ready for the primetime for heavy production use.

## Examples

To see memoization in action, head over to [examples/memoization](https://github.com/clashbit/cater/tree/master/examples/memoization).

## Typical Usage with Cater:

Add the Memoization plugin to your Cater project:

    $ yarn add --dev cater-memoization

In your code:

    import Memoization from 'app/memoization';
    ...
    <Memoization cacheKey={optional-cache-key}>
        ... Expensive Component Rendering ...
    </Memoization>

The cache key should be an identifier that determines the content displayed in the children of the Memoization component. This could be a database primary key, a concatenation of props, or another scheme.

## Additional Comments

Memoization is a useful optimization. But remember that it needs to run at least once at cold start. In the case of this implementation that's for every Node process.
