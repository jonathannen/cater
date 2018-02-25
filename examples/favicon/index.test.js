// Copyright Jon Williams 2017-2018. See LICENSE file.
import request from 'supertest';
import { testHarness } from 'cater';

const handler = testHarness().testHandler();

describe('Favicon Integration Test', () => {
  test('should include the favicon', async () => {
    const res = await request(handler).get('/');
    expect(res.statusCode).toBe(200);

    // The main text
    expect(res.text).toEqual(expect.stringContaining('favicon'));
  });
});
