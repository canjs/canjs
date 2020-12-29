"use strict";
module.exports = function(connection) {
	var ids = [],
		algebra = connection.algebra;

	if(algebra && algebra.clauses && algebra.clauses.id) {
		for(var prop in algebra.clauses.id) {
			ids.push(prop);
		}
	}

	if(connection.idProp && !ids.length) {
		ids.push(connection.idProp);
	}
	if(!ids.length) {
		ids.push('id');
	}
	return ids;
};
