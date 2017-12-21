// Copyright Jon Williams 2017. See LICENSE file.
import React from "react";
import SkipServerSideRender from "app/cater/skipserversiderender";

export default () => (
  <div>
    <h1>An App intended to be run through cater build and then cater server</h1>
    <SkipServerSideRender>
      <p>
        SkipServerSideRender/client -- This only shows when rendering on the
        client-side.
      </p>
    </SkipServerSideRender>
  </div>
);
