/*!
 * CanJS - 2.3.0-pre.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 30 Apr 2015 21:40:42 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.0#view/stache/system*/
var stache = require('./stache.js');
var getIntermediateAndImports = require('./intermediate_and_imports.js');
function translate(load) {
    var intermediateAndImports = getIntermediateAndImports(load.source);
    intermediateAndImports.imports.unshift('can/view/stache/stache');
    return 'define(' + JSON.stringify(intermediateAndImports.imports) + ',function(stache){' + 'return stache(' + JSON.stringify(intermediateAndImports.intermediate) + ')' + '})';
}
module.exports = { translate: translate };
