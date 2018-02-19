// Copyright Jon Williams 2017-2018. See LICENSE file.
import request from 'supertest';
import { testHarness } from 'cater';

const handler = testHarness().testHandler();

describe('Asset Pipeline Tests', () => {
  test('should include the Google Font Links', async () => {
    const res = await request(handler).get('/');
    expect(res.statusCode).toBe(200);

    ['<link ', 'family=Roboto', 'family=Merriweather'].forEach((v) => {
      expect(res.text).toEqual(expect.stringContaining(v));
    });
  });
});
