// Copyright Jon Williams 2017. See LICENSE file.
// import del from 'del';
import fs from "fs";
import { harness } from "cater";
import path from "path";
import request from "supertest";

require.requireActual.ROOT = __dirname;

// We're running webpack, so be generous with timeouts
const TIMEOUT_INTERVAL = 20000;
const handler = harness().testHandler();

const loadFile = function(name) {
  const filePath = path.join(__dirname, "build", name);
  const content = fs.readFileSync(filePath).toString();
  return content;
};

// The build directory is cleared down each time, but we also do here to
// make sure we're not assuming this is happening in testland.
beforeEach(() => {
  // del(path.join(__dirname, 'build'));
});

describe("Production Builds", () => {
  test("should run a simple application", async () => {
    const res = await request(handler).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(expect.stringContaining("(Basic) Hello World!"));
  });

  test(
    "should generate a production build",
    done => {
      const app = harness().testCater({ appRootPath: __dirname, build: true, debug: false });
      app.prepareCommandLine();

      app.runBuild().then(() => {
        expect(loadFile("static/manifest.json")).toEqual(expect.stringContaining("bundle.js"));
        expect(loadFile("manifest.json")).toEqual(expect.stringContaining("bundle.js"));
        done();
      });
    },
    TIMEOUT_INTERVAL
  );
});
