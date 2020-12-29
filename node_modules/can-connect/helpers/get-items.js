"use strict";
module.exports = function(data){
	if(Array.isArray(data)) {
		return data;
	} else {
		return data.data;
	}
};
