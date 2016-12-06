/*!
 * CanJS - 2.3.20
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Tue, 08 Mar 2016 22:45:38 GMT
 * Licensed MIT
 */

/*can@2.3.20#view/stache/add_bundles*/
var loader = require('@loader/');
var can = require('../../util/can.js');
module.exports = function (dynamicImports, parentName) {
    if (!dynamicImports.length) {
        return Promise.resolve();
    }
    var localLoader = loader.localLoader || loader;
    var bundle = localLoader.bundle;
    if (!bundle) {
        bundle = localLoader.bundle = [];
    }
    var bundleNormalizes = [];
    can.each(dynamicImports, function (moduleName) {
        var bundleNormalize = loader.normalize(moduleName, parentName).then(function (moduleName) {
            if (!~bundle.indexOf(moduleName)) {
                bundle.push(moduleName);
            }
        });
        bundleNormalizes.push(bundleNormalize);
    });
    return Promise.all(bundleNormalizes);
};