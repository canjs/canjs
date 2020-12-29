/*!
 * CanJS - 2.3.25
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Wed, 10 Aug 2016 19:17:58 GMT
 * Licensed MIT
 */

/*can@2.3.25#view/ejs/system*/
var can = require('./ejs.js');
function translate(load) {
    return 'define([\'can/view/ejs/ejs\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
        text: load.source,
        name: load.name
    }).template.out + ' })' + ')' + '})';
}
module.exports = { translate: translate };