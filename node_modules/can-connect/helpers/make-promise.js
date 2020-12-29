var canReflect = require("can-reflect");
module.exports = function(obj){
	if (obj && typeof obj.then === "function" && !canReflect.isPromise(obj)) {
		return new Promise(function(resolve, reject) {
			obj.then(resolve, reject);
		});
	}
	else {
		return obj;
	}
};
