steal("can/model", 'can/compute', function (Model) {

	var defStatusFns = {
		isResolved: "resolved",
		isPending: "pending",
		isRejected: "rejected"
	};

	var defFns = [
		"then",
		"done",
		"fail",
		"always",
		"promise"
	];


	can.Model.get = function(){
		// Setup computes and call `findOne` to make the request.
		var result = can.compute(),
			state = can.compute(),
			def = this.findOne.apply(this, arguments),
			wrapper = {},
			val;

		// If `findOne` returned something that is not deferred,
		// manually create deferred object and resolve it with the
		// return value from the `findOne` function.
		if(!can.isDeferred(def)){
			val = def;
			def = new can.Deferred();
			def.resolve(val);
		}

		// Create status check functions.
		can.each(defStatusFns, function (value, method) {
			result[name] = def[method] = function () {
				return state() === value;
			};
		});

		// Proxy functions from the `result` object to the deferred object,
		// to allow the `result` compute to behave like a deferred object.
		can.each(defFns, function (name) {
			result[name] = function () {
				return def[name].apply(def, arguments);
			};
		});

		result(def);
		state(def.state());

		def.then(function(data){
			console.log(data)
			can.batch.start();
			result(data);
			state(def.state());
			can.batch.stop();
		}, function(reason){
			can.batch.start();
			result({
				reason : reason,
				isPending : function(){ return false },
				isResolved : function(){ return false },
				isRejected : function(){ return true }
			});
			state(def.state());
			can.batch.stop();
		});

		return result;
	};

	// Add internal deferred state to the model. It is `resolved` by default
	// because we can assume that if the instance exists, it is resolved, and
	// there shouldn't be any difference in API based on from where does the
	// instance come.
	var oldSetup = can.Model.prototype.setup;

	can.Model.prototype.setup = function(){
		var res = oldSetup.apply(this, arguments);
		this._defState = can.compute('resolved');
		return res;
	};

	// Wrap `save` and `destroy` functions, and change deferred state
	// based on the state of the request.
	can.each(['save', 'destroy'], function(method){
		var old = can.Model.prototype[method];

		can.Model.prototype[method] = function(){
			var res = old.apply(this, arguments),
				def = can.isDeferred(res) ? res : new can.Deferred(),
				self = this;

			def.then(function(){
				self._defState(def.state());
			}, function(){
				self._defState(def.state());
			})

			if(res !== def){
				def.resolve(res);
			}

			return res;
		}
	});

	// Add `isResolved`, `isPending` and `isRejected` to the model prototype.
	can.each(defStatusFns, function(value, method){
		can.Model.prototype[method] = function(){
			return this._defState() === value;
		}
	});
});
