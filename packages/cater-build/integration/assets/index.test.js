// Copyright Jon Williams 2017. See LICENSE file.
// import del from 'del';
import fs from "fs-extra";
import { testHarness } from "cater";
import path from "path";
import request from "supertest";

require.requireActual.ROOT = __dirname;

// We're running webpack, so be generous with timeouts
const TIMEOUT_INTERVAL = 20000;
const handler = testHarness().testHandler();

const loadFile = function(name) {
  const filePath = path.join(__dirname, "build", name);
  const content = fs.readFileSync(filePath).toString();
  return content;
};

// The build directory is cleared down each time, but we also do here to
// make sure we're not assuming this is happening in testland.
beforeAll(() => {
  fs.remove(path.join(__dirname, "build"));
});

describe("Production Builds", () => {
  test("should run a simple application", async () => {
    const res = await request(handler).get("/");
    expect(res.statusCode).toBe(200);

    expect(res.text).toEqual(expect.stringContaining("(Build) Hello World!"));
    expect(res.text).toEqual(expect.stringContaining(".gif"));
  });

  test(
    "should generate a production build with static and transformed assets",
    done => {
      const app = testHarness().testCater({ appRootPath: __dirname, build: true, debug: false });
      app.prepareCommandLine();

      app.runBuild().then(() => {
        // Check the client and server bundles have been generated
        const manifestBody = loadFile("static/manifest.json");
        expect(manifestBody).toEqual(expect.stringContaining("bundle.js"));
        expect(loadFile("manifest.json")).toEqual(expect.stringContaining("bundle.js"));

        // Check on static assets
        expect(loadFile("static/test.txt")).toEqual(expect.stringContaining("TEST TEXT FILE"));

        // Check on transformed assets
        const manifest = JSON.parse(manifestBody);
        ["bundle.js", "cat.gif", "cat.jpg", "cat.png", "cat.svg"].forEach(v => {
          expect(manifest[v]).toBeDefined();
        });

        done();
      });
    },
    TIMEOUT_INTERVAL
  );
});
