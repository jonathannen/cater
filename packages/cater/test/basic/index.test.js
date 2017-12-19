// Copyright Jon Williams 2017. See LICENSE file.
import request from 'supertest';
import { harness } from 'cater';

const hander = harness().testHandler();

describe('Hello-World Integration Test', () => {
    test('should run a simple application', async () => {
        const res = await request(hander).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual(expect.stringContaining("(Basic) Hello World!"));
    });

});