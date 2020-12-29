/*!
 * CanJS - 2.3.34
 * http://canjs.com/
 * Copyright (c) 2018 Bitovi
 * Mon, 30 Apr 2018 20:56:51 GMT
 * Licensed MIT
 */

/*can@2.3.34#view/ejs/system*/
var can = require('./ejs.js');
function translate(load) {
    return 'define([\'can/view/ejs/ejs\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
        text: load.source,
        name: load.name
    }).template.out + ' })' + ')' + '})';
}
module.exports = { translate: translate };