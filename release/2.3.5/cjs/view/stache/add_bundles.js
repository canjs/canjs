/*!
 * CanJS - 2.3.5
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 03 Dec 2015 23:34:11 GMT
 * Licensed MIT
 */

/*can@2.3.5#view/stache/add_bundles*/
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