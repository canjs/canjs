"use strict";
module.exports = function(d, s, id){
	for(var prop in d) {
		if(d.hasOwnProperty(prop) && prop.substr(0,2) !== '__' && prop !== id && !(prop in s)) {
			delete d[prop];
		}
	}
	for(prop in s) {
		d[prop] = s[prop];
	}
	return d;
};
