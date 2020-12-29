/*!
 * CanJS - 2.3.26
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 18 Aug 2016 00:56:47 GMT
 * Licensed MIT
 */

/*can@2.3.26#view/ejs/system*/
var can = require('./ejs.js');
function translate(load) {
    return 'define([\'can/view/ejs/ejs\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
        text: load.source,
        name: load.name
    }).template.out + ' })' + ')' + '})';
}
module.exports = { translate: translate };