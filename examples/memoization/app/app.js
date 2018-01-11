// Copyright Jon Williams 2017-2018. See LICENSE file.
import ExpensiveComponent from './expensive';
import Memoization from 'app/memoization';
import React from 'react';
import Title from 'app/cater/title';

export default () => {
  const cacheKey = 'expensive-component-key';

  return (
    <div>
      <Title>Example showing Memoization on the Server-Side</Title>
      <h1>Hello World!</h1>
      <Memoization cacheKey={cacheKey}>
        <ExpensiveComponent />
      </Memoization>
    </div>
  );
};
