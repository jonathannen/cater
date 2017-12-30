// Copyright Jon Williams 2017. See LICENSE file.
import request from "supertest";
import { harness } from "cater";

const handler = harness().testHandler();

describe("Hello-World Integration Test", () => {
  test("should be polite and say Hello World", async () => {
    const res = await request(handler).get("/");
    expect(res.statusCode).toBe(200);

    // The main text
    expect(res.text).toEqual(expect.stringContaining("Hello World!"));
    // Text in the title
    expect(res.text).toEqual(expect.stringContaining("<title>Hello Down There!</title>"));
  });

});
