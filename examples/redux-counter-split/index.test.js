// Copyright Jon Williams 2017-2018. See LICENSE file.
import request from 'supertest';
import { testHarness } from 'cater';

const handler = testHarness().testHandler();

describe('The Redux Counter test', () => {
  test('should render the counter on the server-side', async () => {
    const res = await request(handler).get('/');
    expect(res.statusCode).toBe(200);

    // The main text
    const textWithoutCommentBlocks = res.text.replace(/<!-- -->/g, '');
    expect(textWithoutCommentBlocks).toEqual(expect.stringMatching(/Clicked: ([0-9]) times/));
  });
});
