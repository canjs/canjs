steal(function(){
	return {
		isDeferred : function( obj ) {
			var isFunction = this.isFunction;
			// Returns `true` if something looks like a deferred.
			return obj && isFunction(obj.then) && isFunction(obj.pipe)
		}
	};
});
