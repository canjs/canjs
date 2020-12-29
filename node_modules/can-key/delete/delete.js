"use strict";
var canReflect = require("can-reflect");
var utils = require("../utils");

/**
 * @module {function} can-key/delete/delete
 * @parent can-key
 */
module.exports = function deleteAtPath(data, path) {
    var parts = utils.parts(path);
    var current = data;

    for(var i = 0; i < parts.length - 1; i++) {
        if(current) {
            current = canReflect.getKeyValue( current, parts[i]);
        }
    }

    if(current) {
        canReflect.deleteKeyValue(current, parts[parts.length - 1 ]);
    }
};
