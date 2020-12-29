var Q = require("q");



// Creates a function that will allow only one function to be running at a time.
module.exports = function(){
	var queue = [];
	var current;
	return function(func){
		var deferred = Q.defer();
		
		var funcPromise = deferred.promise.then(func);
		funcPromise.then(function(){
				current = queue.shift();
				if(current){
					current.resolve();
				}
			}, function(e){
				throw e;
			});
		
		if(!current) {
			current = deferred;
			current.resolve();
		} else {
			queue.push(deferred);
		}
			
		return funcPromise;
		
	};
	
};
