steal('can/util/can.js', function (can) {
	// Which batch of events this is for -- might not want to send multiple
	// messages on the same batch.  This is mostly for event delegation.
	var batchNum = 1,
		// how many times has start been called without a stop
		transactions = 0,
		dispatchingBatch = null,
		collectingBatch = null,
		batches = [],
		dispatchingBatches = false;

	can.batch = {
		/**
		 * @function can.batch.start
		 * @parent can.batch
		 * @description Begin an event batch.
		 *
		 * @signature `can.batch.start([batchStopHandler])`
		 *
		 * @param {Function} [batchStopHandler] a callback that gets called after all batched events have been called
		 *
		 * @body
		 * `can.batch.start` causes can.Map to begin an event batch. Until `[can.batch.stop]` is called, any
		 * events that would result from calls to `[can.Map::attr attr]` are held back from firing. If you have
		 * lots of changes to make to can.Maps, batching them together can help performance &emdash; especially if
		 * those can.Maps are live-bound to the DOM.
		 *
		 * In this example, you can see how the _first_ and _change_ events are not fired (and their handlers
		 * are not called) until `can.batch.stop` is called.
		 *
		 * ```
		 * var person = new can.Map({
		 *     first: 'Alexis',
		 *     last: 'Abril'
		 * });
		 *
		 * person.bind('first', function() {
		 *     console.log("First name changed."");
		 * }).bind('change', function() {
		 *     console.log("Something changed.");
		 * });
		 *
		 * can.batch.start();
		 * person.attr('first', 'Alex');
		 * console.log('Still in the batch.');
		 * can.batch.stop();
		 *
		 * // the log has:
		 * // Still in the batch.
		 * // First name changed.
		 * // Something changed.
		 * ```
		 *
		 * You can also pass a callback to `can.batch.start` which will be called after all the events have
		 * been fired:
		 * ```
		 * can.batch.start(function() {
		 *     console.log('The batch is over.');
		 * });
		 * person.attr('first', 'Izzy');
		 * console.log('Still in the batch.');
		 * can.batch.stop();
		 *
		 * // The console has:
		 * // Still in the batch.
		 * // First name changed.
		 * // Something changed.
		 * // The batch is over.
		 * ```
		 *
		 * ## Calling `can.batch.start` multiple times
		 *
		 * If you call `can.batch.start` more than once, `can.batch.stop` needs to be called
		 * the same number of times before any batched events will fire. For ways
		 * to circumvent this process, see [can.batch.stop].
		 *
		 * Here is an example that demonstrates how events are affected by calling
		 * `can.batch.start` multiple times.
		 *
		 * ```
		 * var addPeople = function(observable) {
		 *     can.batch.start();
		 *     observable.attr('a', 'Alice');
		 *     observable.attr('b', 'Bob');
		 *     observable.attr('e', 'Eve');
		 *     can.batch.stop();
		 * };
		 *
		 * // In a completely different place:
		 * var list = new can.Map();
		 * list.bind('change', function() {
		 *     console.log('The list changed.');
		 * });
		 *
		 * can.batch.start();
		 * addPeople(list);
		 * console.log('Still in the batch.');
		 *
		 * // Here, the console has:
		 * // Still in the batch.
		 *
		 * can.batch.stop();
		 *
		 * // Here, the console has:
		 * // Still in the batch.
		 * // The list changed.
		 * // The list changed.
		 * // The list changed.
		 * ```
		 */
		start: function (batchStopHandler) {
			transactions++;
			if(transactions === 1) {
				var batch = {
					events: [],
					callbacks: [],
					number: batchNum++
				};
				batches.push(batch);
				if (batchStopHandler) {
					batch.callbacks.push(batchStopHandler);
				}
				collectingBatch = batch;
			}

		},
		/**
		 * @function can.batch.stop
		 * @parent can.batch
		 * @description End an event batch.
		 * @signature `can.batch.stop([force[, callStart]])`
		 * @param {bool} [force=false] whether to stop batching events immediately
		 * @param {bool} [callStart=false] whether to call `[can.batch.start can.batch.start]` after firing batched events
		 *
		 * @body
		 * `can.batch.stop` matches an earlier `[can.batch.start]` call. If `can.batch.stop` has been
		 * called as many times as `can.batch.start` (or if _force_ is true), all batched events will be
		 * fired and any callbacks passed to `can.batch.start` since the beginning of the batch will be
		 * called. If _force and _callStart_ are both true, a new batch will be started when all
		 * the events and callbacks have been fired.
		 *
		 * See `[can.batch.start]` for examples of `can.batch.start` and `can.batch.stop` in normal use.
		 *
		 * In this example, the batch is forceably ended in the `addPeople` function.
		 * ```
		 * var addPeople = function(observable) {
		 *     can.batch.start();
		 *     observable.attr('a', 'Alice');
		 *     observable.attr('b', 'Bob');
		 *     observable.attr('e', 'Eve');
		 *     can.batch.stop(true);
		 * };
		 *
		 * // In a completely different place:
		 * var list = new can.Map();
		 * list.bind('change', function() {
		 *     console.log('The list changed.');
		 * });
		 *
		 * can.batch.start();
		 * addPeople(list);
		 * console.log('Still in the batch.');
		 *
		 * // Here, the console has:
		 * // Still in the batch.
		 *
		 * can.batch.stop();
		 *
		 * // Here, the console has:
		 * // The list changed.
		 * // The list changed.
		 * // The list changed.
		 * // Still in the batch.
		 * ```
		 */
		stop: function (force, callStart) {
			if (force) {
				transactions = 0;
			} else {
				transactions--;
			}
			if (transactions === 0) {
				collectingBatch = null;
				var batch;
				if(dispatchingBatches === false) {
					dispatchingBatches = true;
					var callbacks = [],
						i;
					while(batch = batches.shift()) {
						var events = batch.events;
						dispatchingBatch = batch;
						can.batch.batchNum = batch.number;
						
						var len;

						if (callStart) {
							can.batch.start();
						}
						for(i = 0, len = events.length; i < len; i++) {
							can.dispatch.apply(events[i][0],events[i][1]);
						}

						can.batch._onDispatchedEvents(batch.number);
						
						// NOTE: callbacks must be gathered up AFTER dispatching all events
						//       to ensure that callbacks registered by event handlers will be called.
						callbacks.push.apply(callbacks,  batch.callbacks );
						dispatchingBatch = null;
						can.batch.batchNum = undefined;
					}
					for(i = callbacks.length - 1; i >= 0 ; i--) {
						callbacks[i]();
					}
					dispatchingBatches = false;
				}


			}
		},
		_onDispatchedEvents: function(){},
		/**
		 * @function can.batch.trigger
		 * @parent can.batch
		 * @description Trigger an event to be added to the current batch.
		 * @signature `can.batch.trigger(item, event [, args])`
		 * @param {can.Map} item the target of the event
		 * @param {String|{type: String}} event the type of event, or an event object with a type given
		 * @param {Array} [args] the parameters to trigger the event with.
		 *
		 * @body
		 * If events are currently being batched, calling `can.batch.trigger` adds an event
		 * to the batch. If events are not currently being batched, the event is triggered
		 * immediately.
		 */
		trigger: function (item, event, args) {
			// Don't send events if initalizing.
			if (!item.__inSetup) {
				event = typeof event === 'string' ? {
					type: event
				} : event;
				// if there's a batch, add it to this batches events
				if(collectingBatch) {
					event.batchNum = collectingBatch.number;
					collectingBatch.events.push([
						item,
						[event, args]
					]);
				}
				// if this is trying to belong to another batch, let it fire
				else if(event.batchNum) {
					can.dispatch.call( item, event, args );
				}
				// if there are batches, but this doesn't belong to a batch
				// add it to its own batch
				else if(batches.length) {
					can.batch.start();
					event.batchNum = collectingBatch.number;
					collectingBatch.events.push([
						item,
						[event, args]
					]);
					can.batch.stop();
				}
				// there are no batches, so just fire the event.
				else {
					can.dispatch.call( item, event, args );
				}

			}
		},
		// call handler after any events from currently settled stated have fired
		// but before any future change events fire.
		afterPreviousEvents: function(handler){
			var batch = can.last(batches);

			if(batch) {
				var obj = {};
				can.bind.call(obj,"ready", handler);
				batch.events.push([
					obj,
					[{type: "ready"}, []]
				]);
			} else {
				handler({});
			}
		},
		after: function(handler){
			var batch = collectingBatch || dispatchingBatch;

			if(batch) {
				batch.callbacks.push(handler);
			} else {
				handler({});
			}
		}
	};
});
