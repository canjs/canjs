steal("can/util/can.js", "can/list", function (can) {

	var oldReplace = can.List.prototype.replace;

	can.List.prototype.replace = function (data) {
		// First call the old replace so its
		// deferred callbacks will be called first
		var result = oldReplace.apply(this, arguments);
		
		// If there is a promise:
		if (can.isPromise(data)) {
			if(this._deferred) {
				this._deferred.__cancelState = true;
			}
			
			// Set up its state.  Must call this way
			// because we are working on an array.
			can.batch.start();
			this.attr("state", data.state());
			this.removeAttr("reason");
			can.batch.stop();
			
			var self = this;
			// update its state when it changes
			var deferred = this._deferred = new can.Deferred();
			deferred.__cancelState = false;
			
			data.then(function(){
				if(!deferred.__cancelState) {
					self.attr("state", data.state());
					// The deferred methods will always return this object
					deferred.resolve(self);
				}
			},function(reason){
				if(!deferred.__cancelState) {
					can.batch.start();
					self.attr("state", data.state());
					self.attr("reason", reason);
					can.batch.stop();
					deferred.reject(reason);
				}
			});
		}
		return result;
	};
	
	can.each({
		isResolved: "resolved",
		isPending: "pending",
		isRejected: "rejected"
	}, function (value, method) {
		can.List.prototype[method] = function () {
			return this.attr("state") === value;
		};
	});


	can.each([
		"then",
		"done",
		"fail",
		"always",
		"promise"
	], function (name) {
		can.List.prototype[name] = function () {
			// it's possible a list is created manually and returned as the result
			// of .then.  It should not break.
			if(!this._deferred) {
				this._deferred = new can.Deferred();
				this._deferred.resolve(this);
			}
			
			return this._deferred[name].apply(this._deferred, arguments);
		};
	});
});
