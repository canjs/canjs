"use strict";
/*jshint eqeqeq: false */
module.exports = function(connection, props, items){
	var id = connection.id(props);

	for(var i = 0; i < items.length; i++) {
		var connId = connection.id(items[i]);
		if( id == connId) {
			return i;
		}
	}
	return -1;
};
