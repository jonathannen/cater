# Cater-Jest

Cater-Jest contains utilities for testing with the [Jest](https://facebook.github.io/jest/) framework.

These files are mostly workarounds to enable App-like testing within Jest. For example, the [Cater Workspace Package](https://github.com/jonathannen/cater/blob/master/package.json) will test all of the Cater Packages, plus all the Examples.

Generally for your own Cater application you won't need this package - as you're just testing the one application. You still may find this package useful. Plus we'll add in other testing utilities here as the project grows.

## Running tests across multiple Cater environments

If you want to test in a Cater-like environment, these files detect "*index.test.js". For a file that matches this name, the tests will be executed as if that test was the root directory of a Cater application. You can see this with the examples, plus the basic test under cater/test/basic.

The problem is that Jest uses workers, which interally maintain their own module state. This is to enable things like mocking. Unfortunately this conflicts with Cater imports like "app/app".

So! We need to work around it all. The components are:

- __reporter.js__ allows us to understand which test is running. Specifically this allows us to detect a new "*index.test.js" test is running. We can then determine what the current root directory should be.

- __resolver.js__ is what Jest uses to resolve require and imports to specific files. Generally we pass-through the standard mechanisms. However, in the case of 'app/*' and friends, we use the rootDir provided by __reporter.js__ to resolve the file path using Cater rules. 

- __transformer.js__ generates a Babel configuration using the Cater context. This means the Babel options used in testing are the same as other environments. However, we do drop the resolveModuleSource function from the options. This resolveModuleSource, but conflicts with Jest's module resolution. Instead we hook the resolveModuleSource using __resolver.js__ above.
