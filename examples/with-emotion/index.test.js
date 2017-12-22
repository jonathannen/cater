// Copyright Jon Williams 2017. See LICENSE file.

import emotion from "./test/emotion-harness"; // This *must* be imported first

import { harness } from "cater";
import renderer from "react-test-renderer";
import request from "supertest";

const hander = harness().testHandler(__dirname);

describe("Testing example with the Emotion CSS-in-JS library", () => {
  test("should render Hello World page with global and local styles included", async () => {
    const res = await request(hander).get("/");
    expect(res.statusCode).toBe(200);

    // Test for the HTML output "Hello World", plus two colors - tomato
    // is a global style and linen is a component-local one.
    expect(res.text).toEqual(expect.stringContaining("tomato;"));
    expect(res.text).toEqual(expect.stringContaining("linen;"));
    expect(res.text).toEqual(expect.stringContaining("Hello World"));
  });
});
