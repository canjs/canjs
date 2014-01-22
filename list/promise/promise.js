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
		isResolved: "resolved",
		isPending: "pending",
		isRejected: "rejected"
	}, function(value, method){
		can.List.prototype[method] = function(){
			return this.attr("state") == value
		}
	})
	
	can.each(["then","done","always"], function(name){
		can.List.prototype[name] = function(){
			return this._deferred[name].apply(this._deferred, arguments);
		}
	})
})
