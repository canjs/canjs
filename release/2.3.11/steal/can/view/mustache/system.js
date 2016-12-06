/*!
 * CanJS - 2.3.11
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 21 Jan 2016 23:41:15 GMT
 * Licensed MIT
 */

/*can@2.3.11#view/mustache/system*/
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