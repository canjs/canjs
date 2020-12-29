"use strict";
var canReflect = require("can-reflect");

module.exports = function assignExceptIdentity(obj, data, schema) {
    if(!schema) {
        schema = canReflect.getSchema(obj);
    }
    if(!schema) {
        throw new Error("can-diff/update-except-id is unable to update without a schema.");
    }
    // copy the keys onto data
    schema.identity.forEach(function(key){
        var id = canReflect.getKeyValue(obj, key);
        if(id!== undefined) {
            canReflect.setKeyValue(data, key, id );
        }
    });

    canReflect.assignDeep(obj, data);
};
