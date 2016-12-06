/*!
 * CanJS - 2.3.3
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Mon, 30 Nov 2015 23:22:54 GMT
 * Licensed MIT
 */

/*can@2.3.3#view/stache/system*/
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
        return 'define(' + imports + ',function(module, stache, mustacheCore){\n' + '\tvar renderer = stache(' + intermediate + ');\n' + '\treturn function(scope, options){\n' + '\t\tvar moduleOptions = { module: module };\n' + '\t\tif(!(options instanceof mustacheCore.Options)) {\n' + '\t\t\toptions = new mustacheCore.Options(options || {});\n' + '\t\t}\n' + '\t\treturn renderer(scope, options.add(moduleOptions));\n' + '\t};\n' + '});';
    }
    return { translate: translate };
});