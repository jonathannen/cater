// Copyright Jon Williams 2017. See LICENSE file.
import React from 'react';
import styled from 'react-emotion'

const H1 = styled('h1')`
  color: blue;
  font-size: 48px;
  transform: scale(${props => props.scale});
`
/* A simple (but friendly (but stylish)) React Component */
export default () => (
    <H1>Stylish Hello World!</H1>
)