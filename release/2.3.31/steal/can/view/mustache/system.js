/*!
 * CanJS - 2.3.30
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 03 May 2017 15:32:43 GMT
 * Licensed MIT
 */

/*can@2.3.30#view/mustache/system*/
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