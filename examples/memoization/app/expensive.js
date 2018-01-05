// Copyright Jon Williams 2017-2018. See LICENSE file.
import React from 'react';

// A sample component that's "expensive" to render.

export default () => {
  const rows = [];
  for (let i = 0; i < 5000; i += 1) {
    rows.push(<span key={i}> !</span>);
  }
  return rows;
};
