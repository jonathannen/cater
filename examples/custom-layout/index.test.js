// Copyright Jon Williams 2017. See LICENSE file.
import request from 'supertest';
import { harness } from 'cater';

const hander = harness().testHandler();

describe('Custom Layout Integration Test', () => {

    test('should use the layout locally under server/Layout.js', async () => {
        const res = await request(hander).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual(expect.stringContaining("This is a Custom Layout"));
    });

});