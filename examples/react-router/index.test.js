// Copyright Jon Williams 2017-2018. See LICENSE file.
import request from 'supertest';
import { testHarness } from 'cater';

const handler = testHarness().testHandler();

describe('React router integration test', () => {
  test('should render the instruction page at /', async () => {
    const res = await request(handler).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(expect.stringContaining('Cater with React Router'));

    expect(res.text).not.toEqual(expect.stringContaining('Hello!'));
    expect(res.text).not.toEqual(expect.stringContaining('Goodbye!'));
  });

  test('should render the instruction page at /hello', async () => {
    const res = await request(handler).get('/hello');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(expect.stringContaining('Hello!'));
  });

  test('should render the instruction page at /goodbye', async () => {
    const res = await request(handler).get('/goodbye');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(expect.stringContaining('Goodbye!'));
  });
});
