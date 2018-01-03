// Copyright Jon Williams 2017-2018. See LICENSE file.
const config = require('cater-jest')();

// Jest config that also cascades out to integration tests. These are
// "projects" as each cater app test setup needs it's own jest context.
config.projects = ['<rootDir>', '<rootDir>/integration/*'];
config.testPathIgnorePatterns = ['/integration/', '/node_modules/'];

module.exports = config;
