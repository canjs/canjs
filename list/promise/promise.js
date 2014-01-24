steal("can/list", function(list){
	
	var oldReplace = can.List.prototype.replace;
	
	can.List.prototype.replace = function(data){
		// First call the old replace so its
		// deferred callbacks will be called first
		var result = oldReplace.apply(this, arguments);
		
		// If there is a deferred:
		if( can.isDeferred( data ) ) {
			// - set up its setate
			this.attr("state", data.state() );
			var self=  this;
			// update its state when it changes
			data.always(function(){
				self.attr("state", data.state())
			})
			// save the deferred for the deferred methods
			this._deferred = data;
		}
		return result;
	}
	can.each({
		/**
		 * @function can.List.prototype.isResolved
		 * @parent can.List.plugins.promise
		 * 
		 * @signature `list.isResolved()`
		 * 
		 * @return {Boolean} `true` if the list is resolved. `false` if otherwise.
		 * 
		 * @body
		 * 
		 */
		isResolved: "resolved",
		/**
		 * @function can.List.prototype.isPending
		 * @parent can.List.plugins.promise
		 * 
		 * @signature `list.isPending()`
		 * 
		 * @return {Boolean} `true` if the list is pending. `false` if otherwise.
		 * 
		 * @body
		 * 
		 */
		isPending: "pending",
		/**
		 * @function can.List.prototype.isRejected
		 * @parent can.List.plugins.promise
		 * 
		 * @signature `list.isRejected()`
		 * 
		 * @return {Boolean} `true` if the list is rejected. `false` if otherwise.
		 * 
		 * @body
		 * 
		 */
		isRejected: "rejected"
	}, function(value, method){
		can.List.prototype[method] = function(){
			return this.attr("state") == value
		}
	})
	
	can.each([
		/**
		 * @function can.List.prototype.then
		 * @parent can.List.plugins.promise
		 * 
		 * @param {function(*)} doneFilter
		 * 
		 * @param {function(*)} failFilter
		 * 
		 * @return {Promise} A promise that resolves to the current list.
		 * 
		 * @body
		 * 
		 */
		
		"then",
		/**
		 * @function can.List.prototype.done
		 * @parent can.List.plugins.promise
		 * 
		 * @body
		 * 
		 */
		
		"done",
				/**
		 * @function can.List.prototype.always
		 * @parent can.List.plugins.promise
		 * 
		 * @body
		 * 
		 */
		
		"always"], function(name){
		can.List.prototype[name] = function(){
			return this._deferred[name].apply(this._deferred, arguments);
		}
	})
})
