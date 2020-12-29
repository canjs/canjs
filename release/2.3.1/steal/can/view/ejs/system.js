/*!
 * CanJS - 2.3.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 29 Oct 2015 18:42:07 GMT
 * Licensed MIT
 */

/*can@2.3.1#view/ejs/system*/
'format steal';
steal('can/view/ejs', function (can) {
    function translate(load) {
        return 'define([\'can/view/ejs/ejs\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
            text: load.source,
            name: load.name
        }).template.out + ' })' + ')' + '})';
    }
    return { translate: translate };
});