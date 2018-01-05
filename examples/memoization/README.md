# Cater example: Memoization

Demonstrates the Memoization Component that included as a Cater plugin.

As a micro-benchmark, the initial hit takes ~150ms. Each subsequent hit takes &lt;2ms.

## Instructions

Fortunately there isn't much to do in this example. To see the application:

    yarn install
    yarn run dev

Then head on over to http://localhost:3000

The first hit will trigger the Memoization process and will take a lot longer. Each subsequent hit will use the Memoized version of the "Expensive Component".
