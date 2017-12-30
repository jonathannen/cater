// Copyright Jon Williams 2017. See LICENSE file.
import request from "supertest";
import Cater, { testHarness } from "cater";

const handler = testHarness().testHandler();

describe("SkipServerSideRender Component", () => {
  test("should only render the server-side pieces", async () => {
    const res = await request(handler).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(
      expect.stringContaining("SkipServerSideRender/server")
    );
    expect(res.text).not.toEqual(
      expect.stringContaining("SkipServerSideRender/client")
    );
  });
});
