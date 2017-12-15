// Copyright Jon Williams 2017. See LICENSE file.
const fs = require('fs');
const path = require('path');

// Babel options common to client and server sides
const UNIVERSAL_BABEL_OPTIONS = {
    presets: ["env", "react"],
    plugins: [["add-module-exports"]],
}

const isDebug = (v) => v !== 'production';

// Options represents the non-calculated fields for the context.
const options = {
    appComponentName: 'App.js',
    appModulePrefix: 'app/',
    buildDirectory: 'build',
    bundleFilename: 'bundle.js',
    bundlePublicPath: '/static/',
    debug: true,
    entryScriptName: '_entry.js', // Webpack needs an "entry" for generating a bundle
    extensions: ['', '.js', '.jsx'],
    httpPort: 3000,
    hot: true,
    layoutComponentName: 'Layout.js',
    publicPath: '/static/',
    sides: ['client', 'server'],
    universal: ['app'],
}
// Represents the configuration for the client or server side.
class SideConfiguration {

    constructor(side, options) {
        this.side = side;
        this.appModulePrefix = options.appModulePrefix;
        this.extensions = options.extensions;
        this.hot = options.hot;
        this.priorities = options.universal.concat([side]);
        this.publicPath = options.bundlePublicPath;
         
        this.appRootPath = process.cwd();
        this.caterRootPath = __dirname;
        this.debug = isDebug(process.env.NODE_ENV);

        this.buildPath = path.join(this.appRootPath, options.buildDirectory);
        this.rootPaths = [this.appRootPath, this.caterRootPath];

        this.modulePaths = this.generateModulePaths();
        this.babelOptions = this.generateBabelOptions();

        this.entryPath = this.resolve(options.entryScriptName);
        this.bundlePath = `${options.bundlePublicPath}${options.bundleFilename}`;

        this.isClient = this.side == 'client';
        this.isServer = this.side == 'server';

        this.bundleName = path.parse(options.bundleFilename).name;
        if(this.isServer) this.bundleName = '__serverside_' + this.bundleName;
    }

    generateBabelOptions() {
        const babel = Object.assign({}, UNIVERSAL_BABEL_OPTIONS);
        
        // If hot reloading is in play, add in the react-specific plugin
        if(this.hot) babel.plugins[0].push([ "react-hot-loader/babel"]);

        // Custom resolver. This is so an import of "app/Blah" resolves
        // to /home/user/code/yourApp/app/Blah.js (for example).
        babel.resolveModuleSource = (source, filename) => {
            if(!source.startsWith(this.appModulePrefix)) {
                return source;
            }
            const base = source.substring(this.appModulePrefix.length);
            return this.resolve(base);
        }
        return babel;
    }

    generateModulePaths() {
        const result = [];
        for(let root of this.rootPaths) {
            for(let priority of this.priorities) {
                result.push(path.join(root, priority));
            }
        }
        return result;
    }

    resolve(source) {
        const ext = path.extname(source).toLowerCase();
        const extensions = ext.length > 0 ? [''] : this.extensions;

        for(let modulePath of this.modulePaths) {
            for(let extension of extensions) {
                const potential = path.join(modulePath, source + extension);
                if(fs.existsSync(potential)) return potential;                    
            }
        }
        return source;        
    }    

}

class Context {

    constructor(options) {
        this.options = options;
        for(let side of options.sides) {
            this[side] = new SideConfiguration(side, this.options);
        }
    }

}

const createContext = function () {
    return new Context(options);
}

module.exports = createContext;