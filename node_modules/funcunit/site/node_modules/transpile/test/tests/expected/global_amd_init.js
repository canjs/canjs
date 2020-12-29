define('global', [
    'module',
    '@loader'
], function (module, loader) {
    loader.get('@@global-helpers').prepareGlobal(module.id, [], true);
    var define = loader.global.define;
    var require = loader.global.require;
    var source = 'var GLOBAL = "I don\'t like \\"Quotes\\"";';
    var init = function () {
        return window.FOO;
    };
    loader.global.define = undefined;
    loader.global.module = undefined;
    loader.global.exports = undefined;
    loader.__exec({
        'source': source,
        'address': module.uri
    });
    loader.global.require = require;
    loader.global.define = define;
    return loader.get('@@global-helpers').retrieveGlobal(module.id, undefined, init);
});