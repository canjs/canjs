/*!
 * CanJS - 2.3.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Sat, 12 Dec 2015 01:07:53 GMT
 * Licensed MIT
 */

/*can@2.3.6#view/mustache/system*/
'format steal';
steal('can/view/mustache', function (can) {
    function translate(load) {
        return 'define([\'can/view/mustache/mustache\'],function(can){' + 'return can.view.preloadStringRenderer(\'' + load.metadata.pluginArgument + '\',' + 'can.Mustache(function(scope,options) { ' + new can.Mustache({
            text: load.source,
            name: load.name
        }).template.out + ' })' + ')' + '})';
    }
    return { translate: translate };
});