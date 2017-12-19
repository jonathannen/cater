// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';
import styled, { injectGlobal } from 'react-emotion'

injectGlobal`
  body {
    background: tomato;
  }

`

const H1 = styled('h1')`
  color: linen;
  font-size: 48px;
  transform: scale(${props => props.scale});
`
/* A simple (but friendly (but stylish)) React Component */
export default () => (
    <H1>Stylish Hello World!</H1>
)