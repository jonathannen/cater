// Copyright Jon Williams 2017-2018. See LICENSE file.
import crypto from 'crypto';
import Memoization from '../server/memoization';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Produces a different output every time it runs.
class RandomizedOutput extends React.Component {
  render() {
    const hrtime = process.hrtime();
    const id = crypto.randomBytes(32).toString('hex');
    return (
      <div>
        {id}-{hrtime[0]}-{hrtime[1]}
      </div>
    );
  }
}

test('confirm the RandomizedOutput is different each time', () => {
  const first = renderToString(<RandomizedOutput />);
  const second = renderToString(<RandomizedOutput />);
  expect(first).not.toEqual(second);
});

test('that Memoization returns the same result for the same cacheKey', () => {
  const first = renderToString(
    <Memoization cacheKey="1">
      <RandomizedOutput />
    </Memoization>
  );
  const second = renderToString(
    <Memoization cacheKey="1">
      <RandomizedOutput />
    </Memoization>
  );
  expect(first).toEqual(second);
});

test('Memoization returns the correct result for different, interleaved cache keys', () => {
  function memo(cacheKey) {
    return renderToString(
      <Memoization cacheKey={cacheKey}>
        <RandomizedOutput />
      </Memoization>
    );
  }

  // Runs the memoization output through different combinations, ensuring we
  // get consistent results
  expect(memo('1')).toEqual(memo('1'));
  expect(memo('1')).not.toEqual(memo('2'));
  expect(memo('1')).toEqual(memo('1'));
  expect(memo('2')).not.toEqual(memo('1'));
  expect(memo('2')).toEqual(memo('2'));
});
