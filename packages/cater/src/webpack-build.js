// Copyright Jon Williams 2017. See LICENSE file.
import generator from "./webpack-generator";
import webpack from "webpack";

/**
 * Returns a Promise to a Webpack build to the filesystem. Default
 * options will output the server bundle to
 * <project>/build/__serverside_bundle.js and the client to
 * <project>/build/static/bundle.js.
 */
const build = function(context) {
  const clientConfig = generator(context, context.sides.client);
  const serverConfig = generator(context, context.sides.server);
  const compiler = webpack([clientConfig, serverConfig]);

  return new Promise((resolve, reject) => {
    const callback = (err, result) => {
      const errors = result.stats.reduce((result, stat) => {
        return result.concat(stat.compilation.errors);
      }, []);
      const isError = errors.length > 0;
      if (isError) return reject(errors);
      resolve(result);
    };

    compiler.run(callback);
  });
};

export default build;
