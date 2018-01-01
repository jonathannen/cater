// Copyright Jon Williams 2017-2018. See LICENSE file.
import React from 'react';

/* A simple (but friendly) React Component */
export default () => (
  <div>
    <h1>Hello from Cater and Express!</h1>

    <p>
      Most pages are rendered by Cater, including the <a href="/">index page</a>.
    </p>

    <p>
      In debug mode, Cater also provides the client-side bundle at <a href="/static/bundle.js">/static/bundle.js</a>.
    </p>

    <p>
      For reference we&apos;ve also provided a route <a href="/express">served by Express</a> and outside Cater.
    </p>
  </div>
);
