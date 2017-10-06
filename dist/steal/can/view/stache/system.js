/*!
 * CanJS - 2.3.32
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Mon, 02 Oct 2017 16:48:35 GMT
 * Licensed MIT
 */

/*can@2.3.32#view/stache/system*/
'format steal';
steal('can/view/stache', 'can/view/stache/intermediate_and_imports.js', 'can/view/stache/add_bundles.js', function (stache, getIntermediateAndImports, addBundles) {
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
        return 'define(' + imports + ',function(module, stache, mustacheCore){\n' + '\tvar renderer = stache(' + intermediate + ');\n' + '\treturn function(scope, options, nodeList){\n' + '\t\tvar moduleOptions = { module: module };\n' + '\t\tif(!(options instanceof mustacheCore.Options)) {\n' + '\t\t\toptions = new mustacheCore.Options(options || {});\n' + '\t\t}\n' + '\t\treturn renderer(scope, options.add(moduleOptions), nodeList);\n' + '\t};\n' + '});';
    }
    return { translate: translate };
});