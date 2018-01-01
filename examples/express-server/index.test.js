// Copyright Jon Williams 2017-2018. See LICENSE file.
import request from 'supertest';
import { testHarness } from 'cater';
import server from './server';

const handler = testHarness().testHandler();
server.get('*', handler);

describe('Testing Cater embedded with Express Server', () => {
  test('should render Cater content at the root route', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(expect.stringContaining('Hello from Cater and Express!'));
  });

  test('should render express-specific content at the custom express route', async () => {
    const res = await request(server).get('/express');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(expect.stringContaining('This page is rendered directly in Express.'));
  });
});
