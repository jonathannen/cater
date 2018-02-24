// Copyright Jon Williams 2017-2018. See LICENSE file.
import { lighten } from 'polished';
import React from 'react';
import Title from 'app/cater/title';

// Output some polished results
const style = {
  background: lighten(0.2, '#CCCD64')
  // background: lighten(0.2, 'rgba(204,205,100,0.7)')
};

export default () => (
  <div style={style}>
    <Title>Hello Down There!</Title>
    <h1>Hello World!</h1>
    <p>Lighten {style.background}</p>
  </div>
);
