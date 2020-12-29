"use strict";
var canReflect = require("can-reflect");

module.exports = function(items, item, schema){
    var length = canReflect.size(items);
    if(!schema && length > 0) {
        schema = canReflect.getSchema( items[0] );
    }
    if(!schema) {
        schema = canReflect.getSchema( item );
    }
    if(!schema) {
        throw new Error("No schema to use to get identity.");
    }

	var id = canReflect.getIdentity(item, schema);

	for(var i = 0; i < length; i++) {
		var connId = canReflect.getIdentity(items[i], schema);
        // this was ==
		if( id === connId) {
			return i;
		}
	}
	return -1;
};
