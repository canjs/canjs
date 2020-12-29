/*!
 * CanJS - 2.3.13
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 01 Feb 2016 23:57:40 GMT
 * Licensed MIT
 */

/*can@2.3.13#view/ejs/system*/
var can = require('./ejs.js');
function translate(load) {
    return 'define([\'can/view/ejs/ejs\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
        text: load.source,
        name: load.name
    }).template.out + ' })' + ')' + '})';
}
module.exports = { translate: translate };