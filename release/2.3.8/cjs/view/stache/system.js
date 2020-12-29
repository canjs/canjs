/*!
 * CanJS - 2.3.8
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 04 Jan 2016 19:08:12 GMT
 * Licensed MIT
 */

/*can@2.3.8#view/stache/system*/
var stache = require('./stache.js');
var getIntermediateAndImports = require('./intermediate_and_imports.js');
var addBundles = require('./add_bundles.js');
function translate(load) {
    var intermediateAndImports = getIntermediateAndImports(load.source);
    return addBundles(intermediateAndImports.dynamicImports, load.name).then(function () {
        intermediateAndImports.imports.unshift('can/view/stache/mustache_core');
        intermediateAndImports.imports.unshift('can/view/stache/stache');
        intermediateAndImports.imports.unshift('module');
        return template(intermediateAndImports.imports, intermediateAndImports.intermediate);
    });
}
function template(imports, intermediate) {
    imports = JSON.stringify(imports);
    intermediate = JSON.stringify(intermediate);
    return 'define(' + imports + ',function(module, stache, mustacheCore){\n' + '\tvar renderer = stache(' + intermediate + ');\n' + '\treturn function(scope, options){\n' + '\t\tvar moduleOptions = { module: module };\n' + '\t\tif(!(options instanceof mustacheCore.Options)) {\n' + '\t\t\toptions = new mustacheCore.Options(options || {});\n' + '\t\t}\n' + '\t\treturn renderer(scope, options.add(moduleOptions));\n' + '\t};\n' + '});';
}
module.exports = { translate: translate };