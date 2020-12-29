/*can-make-map@1.2.1#can-make-map*/
define('can-make-map', function (require, exports, module) {
    'use strict';
    function makeMap(str) {
        var obj = {}, items = str.split(',');
        items.forEach(function (name) {
            obj[name] = true;
        });
        return obj;
    }
    module.exports = makeMap;
});