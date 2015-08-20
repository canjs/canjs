steal('can/util', 'can/map', function (can) {

	can.transaction = {
		isPaused: false,
		isCancelled: false,
		pauseCallback: undefined,
		batchEvents: [],
		stopCallbacks: [],
		isInATransaction: false,
		start: function () {
			this.isInATransaction = true;
		},
		pause: function (callback) {
			this.isPaused = true;
			this.pauseCallback = callback;
		},
		resume: function () {
			this.isPaused = false;
			this.stop();
		},
		_reset: function(){
			this.stopCallbacks = [];
			this.batchEvents = [];
			this.isPaused = false;
		},
		cancel: function () {
			this._reset();
			this.isCancelled = true;
		},
		_runBatchEvents: function () {
			var i = this.batchEvents.length;

			while (i--) {
				can.dispatch.apply(this.batchEvents[i][0], this.batchEvents[i][1]);
			}
		},
		_runUpdateFunctions: function () {
			var i = this.stopCallbacks.length;

			while (i--) {
				this.stopCallbacks[i]();
			}
		},
		_hasNoEventsOrCallbacks: function () {
			return this.batchEvents !== null && this.stopCallbacks.length === 0;
		},
		stop: function () {

			if (this.isPaused) {
				if (this.pauseCallback) {
					this.pauseCallback();
				}
				return;
			}

			this.isInATransaction = false;

			if (this._hasNoEventsOrCallbacks() || this.isCancelled) {
				this.isCancelled = false;
			}
			else {
				this._runBatchEvents();
				this._runUpdateFunctions();
			}

			this._reset();


		},
		appendCallback: function (callback) {
			this.stopCallbacks.push(callback);
		},
		trigger: function (item, event, args) {
			this.batchEvents.push([item, [event, args]]);
		}
	};

	function getEvent(event, args) {
		return {
			type: event,
			args: args,
			isCanceled: false,
			resume: function () {
				if (can.transaction.isPaused) {
					can.transaction.resume();
				}
			},
			pause: function (callback) {
				can.transaction.pause(callback);
			},
			cancel: function () {
				this.isCanceled = true;
			}
		};
	}

	can.dispatchTransaction = function (event, args, target, defaultBehavior, cancelBehavior) {
		var events = target ? target.__bindEvents : this.__bindEvents;

		if (!events) {
			return event;
		}

		// Initialize the event object
		if (typeof event === 'string') {
			event = getEvent(event, args);
		}

		// Grab event listeners
		var handlers = (events[event.type] || []).slice(0),
			passed = [event];

		if (args) {
			passed.push.apply(passed, args);
		}

		// Execute handlers listening for this event.
		for (var i = 0; i < handlers.length; i++) {
			handlers[i].handler.apply(this, passed);

			if (event.isCanceled) {
				can.transaction.cancel();
				cancelBehavior();
				return;
			} else {
				can.transaction.appendCallback(defaultBehavior);
			}

		}

		return event;
	};

	var oldSet = can.Map.prototype.__set;
	var oldRemove = can.Map.prototype._remove;

	can.extend(can.Map.prototype, {
		_isTransactionChangeEvent: function () {
			return this.__bindEvents && this.__bindEvents.changing && can.transaction.isInATransaction;
		},
		_remove: function (prop, current) {
			var that = this;
			if (this._isTransactionChangeEvent()) {
				can.dispatchTransaction("changing", [prop, current], this,
					function defaultBx() {
						oldRemove.call(that, prop, current);
					},
					function cancelBx(){});
			}
			else {
				oldRemove.call(this, prop, current);
			}
		},
		_getSetChangeType: function (current, prop) {
			return (current !== undefined || this.__get().hasOwnProperty(prop)) ? 'set' : 'add';
		},
		__set: function (prop, value, current) {
			if (value !== current) {
				var that = this;
				var changeType = this._getSetChangeType(current, prop);
				var args = [changeType, prop, value, current];
				if (this._isTransactionChangeEvent()) {
					can.dispatchTransaction("changing", args, this,
						function defaultBx() {
							oldSet.call(that, prop, value, current);
						},
						function cancelBx(){});
				}
				else {
					oldSet.call(this, prop, value, current);
				}
			}
		}
	});

	if(can.route) {
		can.route.batch = can.transaction;
	}

});

