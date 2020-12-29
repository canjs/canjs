"use strict";
var walk = require("../walk/walk");
var utils = require("../utils");
var canReflect = require("can-reflect");

function deleteKeys(parentsAndKeys) {
    for(var i  = parentsAndKeys.length - 1; i >= 0; i--) {
        var parentAndKey = parentsAndKeys[i];
        delete  parentAndKey.parent[parentAndKey.key];
        if(canReflect.size(parentAndKey.parent) !== 0) {
            return;
        }
    }
}
/**
 * @module {function} can-key/transform/transform
 * @parent can-key
 */
module.exports = function(obj, transformer){
    var copy = canReflect.serialize( obj);

    canReflect.eachKey(transformer, function(writeKey, readKey){
        var readParts = utils.parts(readKey),
            writeParts = utils.parts(writeKey);

        // find the value
        var parentsAndKeys = [];
        walk(copy, readParts, function(info){
            parentsAndKeys.push(info);
        });
        var last = parentsAndKeys[parentsAndKeys.length - 1];
        var value = last.value;
        if(value !== undefined) {
            // write the value
            walk(copy, writeParts, function(info, i){
                if(i < writeParts.length - 1 && !info.value) {
                    return info.parent[info.key] = {};
                } else if(i === writeParts.length - 1){
                    info.parent[info.key] = value;
                }
            });
            // delete the keys on old
            deleteKeys(parentsAndKeys);

        }
    });
    return copy;
};
