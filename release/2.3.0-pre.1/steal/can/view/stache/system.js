/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.1#view/stache/system*/
'format steal';
steal('can/view/stache', 'can/view/stache/intermediate_and_imports.js', function (stache, getIntermediateAndImports) {
    function translate(load) {
        var intermediateAndImports = getIntermediateAndImports(load.source);
        intermediateAndImports.imports.unshift('can/view/stache/stache');
        return 'define(' + JSON.stringify(intermediateAndImports.imports) + ',function(stache){' + 'return stache(' + JSON.stringify(intermediateAndImports.intermediate) + ')' + '})';
    }
    return { translate: translate };
});