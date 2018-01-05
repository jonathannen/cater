// Copyright Jon Williams 2017-2018. See LICENSE file.
const DefaultConfig = require('./config-default');
const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');

/**
 * # Config
 *
 * Represents the configuration options for the Cater Runtime - also
 * extended by Cater Build for dev/build time tasks.
 *
 * Config are optional _static_ elements that are used to initialize the
 * Cater application.
 *
 * This class takes care of merging all the different sources of Cater
 * configuration. The priority list lowest to highest is:
 *
 *     defaults, configs in build, configs in root, programmatic values
 *
 * Each config file can also have NODE_ENV and CATER_MODE values. These are
 * merged at each step, rather than at the end. So a production root config
 * one in the build directory.
 *
 * The config files in the build or root directories can either be js or
 * json files. Any file called "cater.config.js(on)" -or-
 * "cater.config.your-name-here.js(on)" will be loaded.
 *
 * In the case of as JS file, the module.exports can either be the configuration
 * as an object or a function. If it's a function the current state of the
 * configuration will be passed to the function. The result of this is then
 * merged in to the configuration.
 *
 * @module cater-runtime/config
 */

const CATER_CONFIG_FILE_MATCH = /^cater\.config\.(.*\.)?js(on)?$/;

class Config {
  constructor(providedConfig, defaultConfig = null) {
    const defaults = defaultConfig || DefaultConfig();
    const provided = providedConfig || {};

    this.assignSpecialValues(defaults, provided);

    // Build a priority list of configurations and merge
    const configFiles = this.loadConfigurationFiles();
    const configSet = [defaults, ...configFiles, provided];
    this.mergeConfigurations(configSet);
  }

  // Some special cases. These values are used to bootstrap everything,
  // including configuration. So they get defined up-front. They should
  // only be set automatically or programatically.
  assignSpecialValues(defaults, provided) {
    this.appRootPath = provided.appRootPath || process.cwd();
    this.buildDirectory = provided.buildDirectory || defaults.buildDirectory;
    this.buildPath = path.join(this.appRootPath, this.buildDirectory);
    this.mode = provided.mode || process.env.CATER_MODE || defaults.mode;
  }

  loadConfigurationFiles() {
    // Determine which directories to traverse
    const includeBuildConfig = ['deploy', 'runtime'].includes(this.mode);
    const directories = includeBuildConfig
      ? [this.buildPath, this.appRootPath]
      : [this.appRootPath];

    const files = directories
      .map((directory) => {
        if (!fs.existsSync(directory)) return [];
        return fs
          .readdirSync(directory)
          .filter((v) => v.match(CATER_CONFIG_FILE_MATCH))
          .map((v) => path.join(directory, v))
          .filter((v) => fs.statSync(v).isFile());
      })
      .reduce((sum, value) => sum.concat(value));

    // eslint-disable-next-line global-require, import/no-dynamic-require
    return files.map((file) => require(file));
  }

  // Merge, right-to-left taking in to account any function configs. It's
  // possible that you can pass a function as a config. In this case, the
  // function get the current merge state as an input.
  mergeConfigurations(configSet) {
    let current = this.processConfiguration(configSet.pop()); // == provided
    while (configSet.length > 0) {
      let next = configSet.pop();
      if (typeof next === 'function') next = next(current);
      next = this.processConfiguration(next);
      current = merge(next, current);
    }

    Object.assign(this, current);
    return current;
  }

  // Takes the "mode" and "env" sections of the config and merges on that
  // basis
  processConfiguration(config) {
    let result = config;
    if (result.env) {
      const envConfig = result.env[process.env.NODE_ENV];
      if (envConfig) result = merge(result, envConfig);
      delete result.env;
    }

    if (result.mode) {
      const modeConfig = result.mode[this.mode];
      if (modeConfig) result = merge(result, modeConfig);
      delete result.mode;
    }
    return result;
  }
}

function generate(providedConfig, defaultConfig) {
  return new Config(providedConfig, defaultConfig);
}

module.exports = generate;
