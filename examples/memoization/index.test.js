// Copyright Jon Williams 2017-2018. See LICENSE file.
import request from 'supertest';
import { testHarness } from 'cater';

const handler = testHarness().testHandler();

test('should run the Memoization example', async () => {
  const res = await request(handler).get('/');
  expect(res.statusCode).toBe(200);

  expect(res.text).toEqual(expect.stringContaining('Hello World!'));
  expect(res.text).toEqual(expect.stringContaining('Memoization'));
});
