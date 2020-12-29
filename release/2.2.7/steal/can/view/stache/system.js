/*!
 * CanJS - 2.2.7
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 24 Jul 2015 20:57:32 GMT
 * Licensed MIT
 */

/*can@2.2.7#view/stache/system*/
'format steal';
steal('can/view/stache', 'can/view/stache/intermediate_and_imports.js', function (stache, getIntermediateAndImports) {
    function translate(load) {
        var intermediateAndImports = getIntermediateAndImports(load.source);
        intermediateAndImports.imports.unshift('can/view/stache/stache');
        return 'define(' + JSON.stringify(intermediateAndImports.imports) + ',function(stache){' + 'return stache(' + JSON.stringify(intermediateAndImports.intermediate) + ')' + '})';
    }
    return { translate: translate };
});