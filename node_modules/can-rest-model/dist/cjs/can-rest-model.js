/*can-rest-model@2.0.0-pre.0#can-rest-model*/
define('can-rest-model', [
    'require',
    'exports',
    'module',
    'can-connect/constructor/constructor',
    'can-connect/can/map/map',
    'can-connect/data/parse/parse',
    'can-connect/data/url/url',
    'can-namespace',
    'can-observable-array',
    'can-observable-object',
    'can-connect/base/base',
    'can-type'
], function (require, exports, module) {
    var constructor = require('can-connect/constructor/constructor');
    var canMap = require('can-connect/can/map/map');
    var dataParse = require('can-connect/data/parse/parse');
    var dataUrl = require('can-connect/data/url/url');
    var namespace = require('can-namespace');
    var ObservableArray = require('can-observable-array');
    var ObservableObject = require('can-observable-object');
    var base = require('can-connect/base/base');
    var type = require('can-type');
    function restModel(optionsOrUrl) {
        var options = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
        if (typeof options.ObjectType === 'undefined') {
            options.ObjectType = class DefaultObjectType extends ObservableObject {
            };
        }
        if (typeof options.ArrayType === 'undefined') {
            options.ArrayType = class DefaultArrayType extends ObservableArray {
                static get items() {
                    return type.convert(options.ObjectType);
                }
            };
        }
        var connection = [
            base,
            dataUrl,
            dataParse,
            constructor,
            canMap
        ].reduce(function (prev, behavior) {
            return behavior(prev);
        }, options);
        connection.init();
        return connection;
    }
    module.exports = namespace.restModel = restModel;
});