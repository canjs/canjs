/*
 * Copyright (c) 2014, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*jslint node: true, nomen: true */

'use strict';

var libfs = require('fs'),
    vm = require('vm'),
    context = vm.createContext({});

// RegExp to detect ES6 modules
// cortesy of https://github.com/ModuleLoader/es6-module-loader
// comprehensively overclassifying regex detectection for es6 module syntax
var ES6ImportExportRegExp = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/,
    ES6AliasRegExp = /(?:^\s*|[}{\(\);,\n]\s*)(export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)"))/;

module.exports = {
    detect: detect,
    extract: extract
};

/**
Analyze JavaScript source, collecting the module or modules information when possible.

@method extract
@default
@param {string} src The JavaScript source to be analyzed
@return {object|array} an object or a collection of object with the info gathered
    from the analysis, it usually includes objects with `type` and `name` per module.
**/
function extract(src) {
    var mods = [];

    /**
    YUI detection is based on a simple rule:
    - if `YUI.add()` is called
    **/
    context.YUI = {
        add: function (name, fn, version, config) {
            mods.push({
                type: 'yui',
                name: name,
                version: version,
                config: config
            });
        }
    };


    /**
    AMD detection is based on a simple rule:
    - if `define()` is called
    **/
    context.define = function () {
        mods.push({
            type: 'amd'
        });
    };

    /**
    Steal detection is based on a simple rule:
    - if `steal()` is called
    **/
    context.steal = function () {
        mods.push({
            type: 'steal'
        });
    };

    /**
    CommonJS detection is based on simple rules:
    -    if the script calls `require()`
    - or if the script tries to export a function thru `module.exports`
    - or if the script tries to export an object thru `module.exports`
    - or if the script tries to export a function thru `exports`
    - or if the script tries to export an object thru `exports`
    - or if the script tries to add a new member to `module.exports`
    **/
    context.require = function () {
        mods.push({
            type: 'cjs'
        });
        throw new Error('Common JS script detected');
    };
    context.exports = Object.create(null);
    context.module = context;


    // executing the JavaScript source into a new context to avoid leaking
    // globals during the detection process.
    try {
        vm.runInContext(src, context);
    } catch (e) {
        // console.log(e.stack || e);
        // detection process for ES modules
        if (ES6ImportExportRegExp.test(src) || ES6AliasRegExp.test(src)) {
            mods.push({type: 'es'});
        }
    } finally {
        // very dummy detection process for CommonJS modules
        if (typeof context.exports === 'function' ||
                typeof context.exports === 'string' ||
                typeof context.exports === 'number' ||
                Object.keys(context.exports).length > 0 ||
                Object.getPrototypeOf(context.exports)) {
            mods.push({type: 'cjs'});
        }
    }

    // returning an array when more than one module is defined in the source
    return mods.length > 1 ? mods : mods[0];
}

/**
Analyze JavaScript source, detecting if the file is a YUI, AMD or ES module.

@method detect
@default
@param {string} src The JavaScript source to be analyzed
@return {string} `yui` or `amd` or `es`
**/
function detect(src) {
    var mod = extract(src);
    if (Array.isArray(mod)) {
        mod = mod.shift(); // picking up the first module from the list
    }
    return mod && mod.type;
}
