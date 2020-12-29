/*!
 * CanJS - 2.3.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 23 Oct 2015 20:30:08 GMT
 * Licensed MIT
 */

/*can@2.3.0#view/stache/system*/
var loader = require('@loader/');
var can = require('../../util/can.js');
var stache = require('./stache.js');
var getIntermediateAndImports = require('./intermediate_and_imports.js');
function addBundles(dynamicImports) {
    if (!dynamicImports.length) {
        return;
    }
    var localLoader = loader.localLoader || loader;
    var bundle = localLoader.bundle;
    if (!bundle) {
        bundle = localLoader.bundle = [];
    }
    can.each(dynamicImports, function (moduleName) {
        if (!~bundle.indexOf(moduleName)) {
            bundle.push(moduleName);
        }
    });
}
function translate(load) {
    var intermediateAndImports = getIntermediateAndImports(load.source);
    addBundles(intermediateAndImports.dynamicImports);
    intermediateAndImports.imports.unshift('can/view/stache/mustache_core');
    intermediateAndImports.imports.unshift('can/view/stache/stache');
    intermediateAndImports.imports.unshift('module');
    return template(intermediateAndImports.imports, intermediateAndImports.intermediate);
}
function template(imports, intermediate) {
    imports = JSON.stringify(imports);
    intermediate = JSON.stringify(intermediate);
    return 'define(' + imports + ',function(module, stache, mustacheCore){\n' + '\tvar renderer = stache(' + intermediate + ');\n' + '\treturn function(scope, options){\n' + '\t\tvar moduleOptions = { module: module };\n' + '\t\tif(!(options instanceof mustacheCore.Options)) {\n' + '\t\t\toptions = new mustacheCore.Options(options || {});\n' + '\t\t}\n' + '\t\treturn renderer(scope, options.add(moduleOptions));\n' + '\t};\n' + '});';
}
module.exports = { translate: translate };