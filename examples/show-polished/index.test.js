// Copyright Jon Williams 2017-2018. See LICENSE file.
import request from 'supertest';
import { testHarness } from 'cater';

const handler = testHarness().testHandler();

describe('Polished Integration Test', () => {
  test('should provide polished helpers', async () => {
    const res = await request(handler).get('/');
    expect(res.statusCode).toBe(200);
    // The main text outputs a polished method output (lightened color)
    expect(res.text).toEqual(expect.stringContaining('#e5e6b1'));
  });
});
