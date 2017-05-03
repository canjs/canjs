steal("can/model", 'can/compute', function () {

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

	var oldModelSetup = can.Model.setup;

	can.Model.setup = function(){
		var res = oldModelSetup.apply(this, arguments);

		wrapFindOne(this);

		return res;
	};

	var wrapFindOne = function(Model){
		var oldFindOne = Model.findOne;
		Model.findOne = function(){
			// Setup computes and call `findOne` to make the request.
			var result = can.compute(),
				state = can.compute(),
				def = oldFindOne.apply(this, arguments),
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
				result[method] = def[method] = function () {
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

			// Add `state` and `reason` functions to keep API unified between
			// the deferred object, compute, error object and returned model
			// instance.
			result.state = state;
			result.reason = def.reason = can.noop;

			result(def);
			state(def.state());

			def.then(function(data){
				can.batch.start();
				result(data);
				state(def.state());
				can.batch.stop();
			}, function(reason){
				can.batch.start();
				result({
					reason : can.compute(reason),
					state : state,
					isPending : function(){ return false; },
					isResolved : function(){ return false; },
					isRejected : function(){ return true; }
				});
				state(def.state());
				can.batch.stop();
			});

			return result;
		};
	};

	var wrapMethods = function(object){
		// Wrap `save` and `destroy` functions, and change deferred state
		// based on the state of the request.
		can.each(['save', 'destroy'], function(method){
			var old = object[method];

			object[method] = function(){
				var res = old.apply(this, arguments),
					def = can.isDeferred(res) ? res : new can.Deferred(),
					self = this;

				can.batch.start();
				this._def.attr('state', def.state());
				this._def.removeAttr('reason');
				can.batch.stop();

				def.then(function(){
					can.batch.start();
					self._def.attr('state', def.state());
					self._def.removeAttr('reason');
					can.batch.stop();
				}, function(reason){
					self._def.attr({
						state : def.state(),
						reason : reason
					});
				});

				if(res !== def){
					def.resolve(res);
				}

				return res;
			};
		});
	};

	// Add internal deferred state to the model. It is `resolved` by default
	// because we can assume that if the instance exists, it is resolved, and
	// there shouldn't be any difference in API based on from where does the
	// instance come.
	var oldSetup = can.Model.prototype.setup;

	can.Model.prototype.setup = function(){
		var res = oldSetup.apply(this, arguments);

		this._def = new can.Map({
			state : 'resolved'
		});

		// Wrap `save` and `destroy` here to ensure that custom implementations
		// work correctly.
		wrapMethods(this);
		
		return res;
	};

	can.Model.prototype.reason = function(){
		return this._def.attr('reason');
	};

	can.Model.prototype.state = function(){
		return this._def.attr('state');
	};

	// Add `isResolved`, `isPending` and `isRejected` to the model prototype.
	can.each(defStatusFns, function(value, method){
		can.Model.prototype[method] = function(){
			return this.state() === value;
		};
	});
});