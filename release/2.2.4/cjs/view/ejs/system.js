/*!
 * CanJS - 2.2.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 03 Apr 2015 23:27:46 GMT
 * Licensed MIT
 */

/*can@2.2.4#view/ejs/system*/
var can = require('./ejs.js');
function translate(load) {
    return 'define([\'can/view/ejs/ejs\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
        text: load.source,
        name: load.name
    }).template.out + ' })' + ')' + '})';
}
module.exports = { translate: translate };
