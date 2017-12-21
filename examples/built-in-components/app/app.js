// Copyright Jon Williams 2017. See LICENSE file.
import React from "react";
import SkipServerSideRender from "app/cater/skipserversiderender";

export default () => (
  <div>
    <h1>Demonstration of some Built-In Cater components:</h1>
    <hr />
    <h2>SkipServerSideRender Component:</h2>
    <p>
      SkipServerSideRender/server -- This only shows when rendering on the
      server-side.
    </p>

    <SkipServerSideRender>
      <p>
        SkipServerSideRender/client -- This only shows when rendering on the
        client-side.
      </p>
    </SkipServerSideRender>
  </div>
);
