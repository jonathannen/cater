// Copyright Jon Williams 2017. See LICENSE file.
const fs = require('fs');
const path = require('path');

// Babel options common to client and server sides
const UNIVERSAL_BABEL_OPTIONS = {
    presets: ["env", "react"],
    plugins: [["add-module-exports"]],
}

const isDebug = function () {
    return process.env.NODE_ENV != 'production';
};

const resolveWithPaths = function(source, paths, extensions) {
    const ext = path.extname(source).toLowerCase();
    const exts = ext.length > 0 ? [''] : extensions;

    for (let modulePath of paths) {
        for (let extension of exts) {
            const potential = path.join(modulePath, source + extension);
            if (fs.existsSync(potential)) return potential;
        }
    }
    return source;
}

// Options represents the non-calculated fields for the context.
const options = {
    appComponentName: 'App.js',
    buildDirectory: 'build',
    bundleFilename: 'bundle.js',
    bundlePublicPath: '/static/',
    entryScriptName: '_entry.js', // Webpack needs an "entry" for generating a bundle
    extensions: ['', '.js', '.jsx'],
    httpPort: 3000,
    hot: true,
    layoutComponentName: 'Layout.js',
    publicPath: '/static/',

    sides: ['client', 'server'],
    universal: ['app'],
    universalPrefix: 'app',
}

// Represents the configuration for the client or server side.
class SideConfiguration {

    constructor(context, side) {
        this.side = side;
        const options = context.options;
        this.extensions = options.extensions;
        this.isClient = this.side == 'client';
        this.isServer = this.side == 'server';
    
        this.sidePaths = context.generatePaths([side])
        this.paths = context.universalPaths.concat(this.sidePaths);
        this.bundlePath = `${options.bundlePublicPath}${options.bundleFilename}`;

        this.entryPath = this.resolve(options.entryScriptName);

        this.bundleName = path.parse(options.bundleFilename).name;
        if (this.isServer) this.bundleName = '__serverside_' + this.bundleName;
    }

    resolve(source) {
        return resolveWithPaths(source, this.paths, this.extensions);
    }

    resolveSide(source) {
        return resolveWithPaths(source, this.sidePaths, this.extensions);
    }

}

class Context {

    constructor(options) {
        this.options = options;

        this.appRootPath = process.cwd();
        this.buildPath = path.join(this.appRootPath, options.buildDirectory);
        this.caterRootPath = __dirname;
        this.debug = isDebug(this);

        this.rootPaths = [this.appRootPath, this.caterRootPath];
        this.universalPaths = this.generatePaths(options.universal);

        for (let side of options.sides) {
            const sideConfig = this[side] = new SideConfiguration(this, side);
            sideConfig.babelOptions = this.generateBabelOptions(sideConfig);
        }
        this.babelOptions = this.server.babelOptions;

        this.importPrefixResolvers = {
            app: (side) => side.resolve.bind(side),
            client: () => this.client.resolveSide.bind(this.client),
            server: () => this.server.resolveSide.bind(this.server),
        }
    }

    generateBabelOptions(sideConfig) {
        const babel = Object.assign({}, UNIVERSAL_BABEL_OPTIONS);
        babel.resolveModuleSource = this.generateBabelResolveModuleSource(sideConfig);
        return babel;
    }

    generateBabelResolveModuleSource(side) {
        return (source, filename) => {
            for (let prefix of Object.keys(this.importPrefixResolvers)) {
                if (source.startsWith(`${prefix}/`)) {
                    const base = source.substring(prefix.length + 1);
                    const resolve = this.importPrefixResolvers[prefix];
                    const result = resolve(side)(base);
                    return result;
                }
            }
            return source;
        };
    }

    generatePaths(dirNames) {
        const result = [];
        for (let root of this.rootPaths) {
            for (let dir of dirNames) {
                const candidate = path.join(root, dir);
                if (fs.existsSync(candidate)) result.push(candidate);
            }
        }
        return result;
    }

    resolve(source, side = 'server') {
        return this.resolveWithPaths(source, this.sides[side].paths, this.options.extensions);
    }

}

const createContext = function () {
    return new Context(options);
}

module.exports = createContext;