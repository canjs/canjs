/*!
 * CanJS - 2.3.14
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 06 Feb 2016 00:01:32 GMT
 * Licensed MIT
 */

/*can@2.3.14#view/mustache/system*/
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