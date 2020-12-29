


module.exports = function(functions, args){
	var promise = functions.shift()(args);
	
	while(func = functions.shift()) {
		promise = promise.then(func);	
	}
	return promise;
};
