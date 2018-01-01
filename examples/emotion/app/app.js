// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';
import styled, { injectGlobal } from 'react-emotion';

injectGlobal`
  body {
    background: tomato;
  }
`;

const H1 = styled('h1')`
  color: linen;
  font-size: 48px;
  font-family: 'Helvetica Neue', san-serif;
  font-weight: 200;
  text-align: center;
  transform: scale(${props => props.scale});
  a {
    color: linen;
    font-weight: 800;
  }
`;

/* A simple (but friendly (but stylish)) React Component */
export default () => (
  <H1>
    Stylish Hello World!<a href="/">...</a>
  </H1>
);
