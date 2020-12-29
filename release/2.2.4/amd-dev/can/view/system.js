/*!
 * CanJS - 2.2.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 03 Apr 2015 23:27:46 GMT
 * Licensed MIT
 */

/*can@2.2.4#view/stache/system*/
'format steal';
define([
    'can/view/stache',
    'can/view/intermediate_and_imports'
], function (stache, getIntermediateAndImports) {
    function translate(load) {
        var intermediateAndImports = getIntermediateAndImports(load.source);
        intermediateAndImports.imports.unshift('can/view/stache/stache');
        return 'define(' + JSON.stringify(intermediateAndImports.imports) + ',function(stache){' + 'return stache(' + JSON.stringify(intermediateAndImports.intermediate) + ')' + '})';
    }
    return { translate: translate };
});
