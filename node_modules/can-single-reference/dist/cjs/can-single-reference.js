/*can-single-reference@1.2.2#can-single-reference*/
'use strict';
var CID = require('can-cid');
var singleReference;
function getKeyName(key, extraKey) {
    var keyName = extraKey ? CID(key) + ':' + extraKey : CID(key);
    return keyName || key;
}
singleReference = {
    set: function (obj, key, value, extraKey) {
        obj[getKeyName(key, extraKey)] = value;
    },
    getAndDelete: function (obj, key, extraKey) {
        var keyName = getKeyName(key, extraKey);
        var value = obj[keyName];
        delete obj[keyName];
        return value;
    }
};
module.exports = singleReference;