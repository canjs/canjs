steal(function(){
	
	var Deferred = function( func ) {
		if ( ! ( this instanceof Deferred ))
			return new Deferred();

		this._doneFuncs = [];
		this._failFuncs = [];
		this._resultArgs = null;
		this._status = "";

		// check for option function: call it with this as context and as first 
		// parameter, as specified in jQuery api
		func && func.call(this, this);
	};
	can.Deferred = Deferred;
	can.when = Deferred.when = function() {
		var args = can.makeArray( arguments );
		if (args.length < 2) {
			var obj = args[0];
			if (obj && ( can.isFunction( obj.isResolved ) && can.isFunction( obj.isRejected ))) {
				return obj;			
			} else {
				return Deferred().resolve(obj);
			}
		} else {
			
			var df = Deferred(),
				done = 0,
				// resolve params: params of each resolve, we need to track down 
				// them to be able to pass them in the correct order if the master 
				// needs to be resolved
				rp = [];

			can.each(args, function(j, arg){
				arg.done(function() {
					rp[j] = (arguments.length < 2) ? arguments[0] : arguments;
					if (++done == args.length) {
						df.resolve.apply(df, rp);
					}
				}).fail(function() {
					df.reject(arguments);
				});
			});

			return df;
			
		}
	}
	
	var resolveFunc = function(type, _status){
		return function(context){
			var args = this._resultArgs = (arguments.length > 1) ? arguments[1] : [];
			return this.exec(context, this[type], args, _status);
		}
	},
	doneFunc = function(type, _status){
		return function(){
			var self = this;
			can.each(arguments, function( i, v, args ) {
				if ( ! v )
					return;
				if ( v.constructor === Array ) {
					args.callee.apply(self, v)
				} else {
					// immediately call the function if the deferred has been resolved
					if (self._status === _status)
						v.apply(self, self._resultArgs || []);
	
					self[type].push(v);
				}
			});
			return this;
		}
	};

	can.extend(Deferred.prototype, {
		/**
		 * @function pipe
		 * Utility to filter Deferred(s).
		 *
		 * 		var def = can.Deferred(),
		 *			filtered = def.pipe(function(val) {
		 *      		return val + " is awesome!";
		 *  		});
		 *
		 * 		def.resolve('Can');
		 * 
		 * 		filtered.done(function(value) {
		 * 			alert(value); // Alerts: 'Can is awesome!'
		 * 		});
		 *
		 * @param {Object} doneCallbacks A function called when the Deferred is resolved.
		 * @param {Object} failCallbacks A function called when the Deferred is rejected.
		 */
		pipe : function(done, fail){
			var d = can.Deferred();
			this.done(function(){
				d.resolve( done.apply(this, arguments) );
			});
			
			this.fail(function(){
				if(fail){
					d.reject( fail.apply(this, arguments) );
				} else {
					d.reject.apply(d, arguments);
				}
			});
			return d;
		},
		
		/**
		 * @function resolveWith
		 * Rejects a Deferred and calls the doneCallbacks give the arguments.
		 */
		resolveWith : resolveFunc("_doneFuncs","rs"),
		
		/**
		 * @function rejectWith
		 * Rejects a Deferred and calls the failCallbacks give the arguments.
		 */
		rejectWith : resolveFunc("_failFuncs","rj"),
		
		/**
		 * @function done
		 * Add handlers to be called when the Deferred object is done.
		 * @param {Object} successCallbacks function that is called when the Deferred is resolved.
		 */
		done : doneFunc("_doneFuncs","rs"),
		
		/**
		 * @function fail
		 * Add handlers to be called when the Deferred object is rejected.
		 * @param {Object} failCallbacks function that is called when the Deferred is rejected.
		 */
		fail : doneFunc("_failFuncs","rj"),
		
		/**
		 * @function always
		 * Add handlers to be called when the Deferred object is either resolved or rejected.
		 *
		 * 		deferred.always( alwaysCallbacks )
		 *
		 * @param {Object} alwaysCallbacks A function called when the Deferred is resolved or rejected.
		 */
		always : function() {
			var args = can.makeArray(arguments);
			if (args.length && args[0])
				this.done(args[0]).fail(args[0]);

			return this;
		},

		/**
		 * @function then
		 * Add handlers to be called when the Deferred object to be called after its resolved.
		 *
		 * 		deferred.then( doneCallbacks, failCallbacks )
		 *
		 * @param {Object} doneCallbacks A function called when the Deferred is resolved.
		 * @param {Object} failCallbacks A function called when the Deferred is rejected.
		 */
		then : function() {
			var args = can.makeArray( arguments );
			// fail function(s)
			if (args.length > 1 && args[1])
				this.fail(args[1]);

			// done function(s)
			if (args.length && args[0])
				this.done(args[0]);

			return this;
		},

		/**
		 * @function isResolved
		 * Returns whether a Deferred object has been resolved.
		 *
		 * 		deferred.isResolved()
		 *
		 */
		isResolved : function() {
			return this._status === "rs";
		},

		/**
		 * @function isRejected
		 * Returns whether a Deferred object has been rejected.
		 *
		 * 		deferred.isRejected()
		 *
		 */
		isRejected : function() {
			return this._status === "rj";
		},
		
		/**
		 * @function reject
		 * Rejects the Deferred object and calls the fail callbacks with the given arguments.
		 *
		 * 		deferred.reject( args )
		 *
		 * @param {Object} arguments Optional arguments that are passed to the fail callbacks.
		 */
		reject : function() {
			return this.rejectWith(this, arguments);
		},

		/**
		 * @function resolve
		 * Resolves a Deferred object and calls the done callbacks with the given arguments.
		 *
		 * 		deferred.resolve( args )
		 *
		 * @param {Object} arguments Optional arguments that are passed to the done callbacks.
		 */
		resolve : function() {
			return this.resolveWith(this, arguments);
		},

		/**
		 * @hide
		 * Executes the callbacks of the Deferred object.
		 */
		exec : function(context, dst, args, st) {
			if (this._status !== "")
				return this;

			this._status = st;

			can.each(dst, function(i, d){
				d.apply(context, args);
			});

			return this;
		}
	});


})
