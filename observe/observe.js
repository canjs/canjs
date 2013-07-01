// 1.69
steal('can/util','can/util/bind','can/construct', function(can, bind) {
	// ## observe.js  
	// `can.Observe`  
	// _Provides the observable pattern for JavaScript Objects._  
	//  
	// Returns `true` if something is an object with properties of its own.
	var canMakeObserve = function( obj ) {
			return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject( obj ) || ( obj instanceof can.Observe ));
		},
		
		// Removes all listeners.
		unhookup = function(items, namespace){
			return can.each(items, function(item){
				if(item && item.unbind){
					item.unbind("change" + namespace);
				}
			});
		},
		// Listens to changes on `child` and "bubbles" the event up.  
		// `child` - The object to listen for changes on.  
		// `prop` - The property name is at on.  
		// `parent` - The parent object of prop.
		// `ob` - (optional) The Observe object constructor
		// `list` - (optional) The observable list constructor
		hookupBubble = function( child, prop, parent, Ob, List ) {
			Ob = Ob || Observe;
			List = List || Observe.List;

			// If it's an `array` make a list, otherwise a child.
			if (child instanceof Observe){
				// We have an `observe` already...
				// Make sure it is not listening to this already
				// It's only listening if it has bindings already.
				parent._bindings &&unhookup([child], parent._cid);
			} else if ( can.isArray(child) ) {
				child = new List(child);
			} else {
				child = new Ob(child);
			}
			// only listen if something is listening to you
			if(parent._bindings){
				// Listen to all changes and `batchTrigger` upwards.
				bindToChildAndBubbleToParent(child, prop, parent)
			}
			

			return child;
		},
		bindToChildAndBubbleToParent = function(child, prop, parent){
			child.bind("change" + parent._cid, 
				function( /* ev, attr */ ) {
				// `batchTrigger` the type on this...
				var args = can.makeArray(arguments),
					ev = args.shift();
					args[0] = (prop === "*" ? 
						[ parent.indexOf( child ), args[0]] :
						[ prop, args[0]] ).join(".");

				// track objects dispatched on this observe		
				ev.triggeredNS = ev.triggeredNS || {};

				// if it has already been dispatched exit
				if (ev.triggeredNS[parent._cid]) {
					return;
				}

				ev.triggeredNS[parent._cid] = true;
				// send change event with modified attr to parent	
				can.trigger(parent, ev, args);
				// send modified attr event to parent
				//can.trigger(parent, args[0], args);
			});
		},
		// An `id` to track events for a given observe.
		observeId = 0,
		// A helper used to serialize an `Observe` or `Observe.List`.  
		// `observe` - The observable.  
		// `how` - To serialize with `attr` or `serialize`.  
		// `where` - To put properties, in an `{}` or `[]`.
		serialize = function( observe, how, where ) {
			// Go through each property.
			observe.each(function( val, name ) {
				// If the value is an `object`, and has an `attrs` or `serialize` function.
				where[name] = canMakeObserve(val) && can.isFunction( val[how] ) ?
				// Call `attrs` or `serialize` to get the original data back.
				val[how]() :
				// Otherwise return the value.
				val;
			});
			return where;
		},
		attrParts = function(attr, keepKey) {
			if(keepKey) {
				return [attr];
			}
			return can.isArray(attr) ? attr : (""+attr).split(".");
		},
		// Which batch of events this is for -- might not want to send multiple
		// messages on the same batch.  This is mostly for event delegation.
		batchNum = 1,
		// how many times has start been called without a stop
		transactions = 0,
		// an array of events within a transaction
		batchEvents = [],
		stopCallbacks = [],
		makeBindSetup = function(wildcard){
			return function(){
				var parent = this;
				this._each(function(child, prop){
					if(child && child.bind){
						bindToChildAndBubbleToParent(child, wildcard || prop, parent)
					}
				})
			};
		};
	
	/**
	 * @add can.Observe
	 */
	//
	var Observe = can.Map = can.Observe = can.Construct( {
	/**
	 * @static
	 */
		// keep so it can be overwritten
		bind : can.bindAndSetup,
		unbind: can.unbindAndTeardown,
		id: "id",
		canMakeObserve : canMakeObserve,
		// starts collecting events
		// takes a callback for after they are updated
		// how could you hook into after ejs
		/**
		 * @function can.Observe.startBatch startBatch
		 * @parent can.Observe.static
		 * @description Begin an event batch.
		 * 
		 * @signature `can.Observe.startBatch([batchStopHandler])`
		 * 
		 * @param {Function} [batchStopHandler] a callback that gets called after all batched events have been called
		 *
		 * @body
		 * `startBatch` causes can.Observe to begin an event batch. Until `[can.Observe.stopBatch]` is called, any
		 * events that would result from calls to `[can.Observe::attr attr]` are held back from firing. If you have
		 * lots of changes to make to can.Observes, batching them together can help performance &emdash; especially if
		 * those can.Observes are live-bound to the DOM.
		 *
		 * In this example, you can see how the _first_ and _change_ events are not fired (and their handlers
		 * are not called) until `stopBatch` is called.
		 *
		 * @codestart
		 * var person = new can.Observe({
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
		 * can.Observe.startBatch();
		 * person.attr('first', 'Alex');
		 * console.log('Still in the batch.');
		 * can.Observe.stopBatch();
		 * 
		 * // the log has:
		 * // Still in the batch.
		 * // First name changed.
		 * // Something changed.
		 * @codeend
		 *
		 * You can also pass a callback to `startBatch` which will be called after all the events have
		 * been fired:
		 * @codestart
		 * can.Observe.startBatch(function() {
		 *     console.log('The batch is over.');
		 * });
		 * person.attr('first', 'Izzy');
		 * console.log('Still in the batch.');
		 * can.Observe.stopBatch();
		 * 
		 * // The console has:
		 * // Still in the batch.
		 * // First name changed.
		 * // Something changed.
		 * // The batch is over.
		 * @codeend
		 *
		 * ## Calling `startBatch` multiple times
		 * 
		 * If you call `startBatch` more than once, `stopBatch` needs to be called
		 * the same number of times before any batched events will fire. For ways
		 * to circumvent this process, see [can.Observe.stopBatch].
		 *
		 * Here is an example that demonstrates how events are affected by calling
		 * `startBatch` multiple times.
		 * 
		 * @codestart
		 * var addPeople = function(observable) {
		 *     can.Observe.startBatch();
		 *     observable.attr('a', 'Alice');
		 *     observable.attr('b', 'Bob');
		 *     observable.attr('e', 'Eve');
		 *     can.Observe.stopBatch();
		 * };
		 *
		 * // In a completely different place:
		 * var list = new can.Observe();
		 * list.bind('change', function() {
		 *     console.log('The list changed.');
		 * });
		 *
		 * can.Observe.startBatch();
		 * addPeople(list);
		 * console.log('Still in the batch.');
		 *
		 * // Here, the console has:
		 * // Still in the batch.
		 * 
		 * can.Observe.stopBatch();
		 * 
		 * // Here, the console has:
		 * // Still in the batch.
		 * // The list changed.
		 * // The list changed.
		 * // The list changed.
		 * @codeend
		 */
		startBatch: function( batchStopHandler ) {
			transactions++;
			batchStopHandler && stopCallbacks.push(batchStopHandler);
		},
		/**
		 * @function can.Observe.stopBatch stopBatch
		 * @parent can.Observe.static
		 * @description End an event batch.
		 * @signature `can.Observe.stopBatch([force[, callStart]])`
		 * @param {bool} [force=false] whether to stop batching events immediately
		 * @param {bool} [callStart=false] whether to call `[can.Observe.startBatch startBatch]` after firing batched events
		 * 
		 * @body
		 * `stopBatch` matches an earlier `[can.Observe.startBatch]` call. If `stopBatch` has been
		 * called as many times as `startBatch` (or if _force_ is true), all batched events will be
		 * fired and any callbacks passed to `startBatch` since the beginning of the batch will be
		 * called. If _force and _callStart_ are both true, a new batch will be started when all
		 * the events and callbacks have been fired.
		 *
		 * See `[can.Observe.startBatch]` for examples of `startBatch` and `stopBatch` in normal use.
		 * 
		 * In this example, the batch is forceably ended in the `addPeople` function.
		 * @codestart
		 * var addPeople = function(observable) {
		 *     can.Observe.startBatch();
		 *     observable.attr('a', 'Alice');
		 *     observable.attr('b', 'Bob');
		 *     observable.attr('e', 'Eve');
		 *     can.Observe.stopBatch(true);
		 * };
		 *
		 * // In a completely different place:
		 * var list = new can.Observe();
		 * list.bind('change', function() {
		 *     console.log('The list changed.');
		 * });
		 *
		 * can.Observe.startBatch();
		 * addPeople(list);
		 * console.log('Still in the batch.');
		 *
		 * // Here, the console has:
		 * // Still in the batch.
		 * 
		 * can.Observe.stopBatch();
		 * 
		 * // Here, the console has:
		 * // The list changed.
		 * // The list changed.
		 * // The list changed.
		 * // Still in the batch.
		 * @codeend
		 */
		stopBatch: function(force, callStart){
			if(force){
				transactions = 0;
			} else {
				transactions--;
			}
			
			if(transactions == 0){
				var items = batchEvents.slice(0),
					callbacks = stopCallbacks.slice(0);
				batchEvents= [];
				stopCallbacks = [];
				batchNum++;
				callStart && this.startBatch();
				can.each(items, function( args ) {
					can.trigger.apply(can, args);
				});
				can.each(callbacks, function( cb ) {
					cb();
				});
			}
		},
		/**
		 * @function can.Observe.triggerBatch triggerBatch
		 * @parent can.Observe.static
		 * @description Trigger an event to be added to the current batch.
		 * @signature `can.Observe.triggerBatch(item, event [, args])`
		 * @param {can.Observe} item the target of the event
		 * @param {String|{type: String}} event the type of event, or an event object with a type given
		 * @param {Array} [args] the parameters to trigger the event with.
		 * 
		 * @body
		 * If events are currently being batched, calling `triggerBatch` adds an event
		 * to the batch. If events are not currently being batched, the event is triggered
		 * immediately.
		 */
		triggerBatch: function( item, event, args ) {
			// Don't send events if initalizing.
			if ( ! item._init) {
				if (transactions == 0 ) {
					return can.trigger(item, event, args);
				} else {
					event = typeof event === "string" ?
						{ type: event } : 
						event;
					event.batchNum = batchNum;
					batchEvents.push([
					item,
					event, 
					args ] );
				}
			}
		},
		/**
		 * @function can.Observe.keys keys
		 * @parent can.Observe.static
		 * @description Iterate over the keys of an Observe.
		 * @signature `can.Observe.keys(observe)`
		 * @param {can.Observe} observe the `can.Observe` to get the keys from
		 * @return {Array} array An array containing the keys from _observe_.
		 * 
		 * @body
		 * `keys` iterates over an observe to get an array of its keys.
		 * 
		 * @codestart
		 * var people = new can.Observe({
		 *     a: 'Alice',
		 *     b: 'Bob',
		 *     e: 'Eve'
		 * });
		 * 
		 * can.Observe.keys(people); // ['a', 'b', 'e']
		 * @codeend
		 */
		keys: function(observe) {
			var keys = [];
			Observe.__reading && Observe.__reading(observe, '__keys');
			for(var keyName in observe._data) {
				keys.push(keyName);
			}
			return keys;
		}
	},
	/**
	 * @prototype
	 */
	{
		setup: function( obj ) {
			// `_data` is where we keep the properties.
			this._data = {};
			/**
			 * @property {String} can.Observe.prototype._cid
			 * @hide
			 *
			 * A globally unique ID for this `can.Observe` instance.
			 */
			// The namespace this `object` uses to listen to events.
			can.cid(this, ".observe");
			// Sets all `attrs`.
			this._init = 1;
			this.attr(obj);
			this.bind('change'+this._cid,can.proxy(this._changes,this));
			delete this._init;
		},
		_bindsetup: makeBindSetup(),
		_bindteardown: function(){
			var cid = this._cid;
			this._each(function(child){
				unhookup([child], cid)
			})
		},
		_changes: function(ev, attr, how,newVal, oldVal){
			Observe.triggerBatch(this, {type:attr, batchNum: ev.batchNum}, [newVal,oldVal]);
		},
		_triggerChange: function(attr, how,newVal, oldVal){
			Observe.triggerBatch(this,"change",can.makeArray(arguments))
		},
		// no live binding iterator
		_each: function(callback){
			var data = this.__get();
			for(var prop in data){
				if(data.hasOwnProperty(prop)){
					callback(data[prop],prop)
				}
			}
		},
		/**
		 * @function can.Observe.prototype.attr attr
		 * @description Get or set properties on an Observe.
		 * @signature `observe.attr()`
		 * 
		 * Gets a collection of all the properties in this `can.Observe`.
		 * 
		 * @return {Object<String, *>} an object with all the properties in this `can.Observe`.
		 * 
		 * @signature `observe.attr(key)`
		 * 
		 * Reads a property from this `can.Observe`.
		 * 
		 * @param {String} key the property to read
		 * @return {*} the value assigned to _key_.
		 *
		 * @signature `observe.attr(key, value)`
		 * 
		 * Assigns _value_ to a property on this `can.Observe` called _key_.
		 * 
		 * @param {String} key the property to set
		 * @param {*} the value to assign to _key_.
		 * @return {can.Observe} this Observe, for chaining
		 * 
		 * @signature `observe.attr(obj[, removeOthers])`
		 * 
		 * Assigns each value in _obj_ to a property on this `can.Observe` named after the
		 * corresponding key in _obj_, effectively merging _obj_ into the Observe.
		 * 
		 * @param {Object<String, *>} obj a collection of key-value pairs to set.
		 * If any properties already exist on the `can.Observe`, they will be overwritten.
		 *
		 * @param {bool} [removeOthers=false] whether to remove keys not present in _obj_.
		 * To remove keys without setting other keys, use `[can.Observe::removeAttr removeAttr]`.
		 *
		 * @return {can.Observe} this Observe, for chaining
		 * 
		 * @body
		 * `attr` gets or sets properties on the `can.Observe` it's called on. Here's a tour through
		 * how all of its forms work:
		 *
		 * @codestart
		 * var people = new can.Observe({});
		 * 
		 * // set a property:
		 * people.attr('a', 'Alex');
		 * 
		 * // get a property:
		 * people.attr('a'); // 'Alex'
		 *
		 * // set and merge multiple properties:
		 * people.attr({
		 *     a: 'Alice',
		 *     b: 'Bob'
		 * });
		 * 
		 * // get all properties:
		 * people.attr(); // {a: 'Alice', b: 'Bob'}
		 * 
		 * // set properties while removing others:
		 * people.attr({
		 *     b: 'Bill',
		 *     e: 'Eve'
		 * }, true);
		 *
		 * people.attr(); // {b: 'Bill', e: 'Eve'}
		 * @codeend
		 * 
		 * ## Deep properties
		 * 
		 * `attr` can also set and read deep properties. All you have to do is specify
		 * the property name as you normally would if you weren't using `attr`.
		 * 
		 * @codestart
		 * var people = new can.Observe({names: {}});
		 * 
		 * // set a property:
		 * people.attr('names.a', 'Alice');
		 * 
		 * // get a property:
		 * people.attr('names.a'); // 'Alice'
		 * people.names.attr('a'); // 'Alice'
		 *
		 * // get all properties:
		 * people.attr(); // {names: {a: 'Alice'}}
		 * @codeend
		 * 
		 * Objects that are added to Observes become Observes themselves behind the scenes,
		 * so changes to deep properties fire events at each level, and you can bind at any
		 * level. As this example shows, all the same events are fired no matter what level
		 * you call `attr` at:
		 * 
		 * @codestart
		 * var people = new can.Observe({names: {}});
		 *
		 * people.bind('change', function(ev, attr, how, newVal, oldVal) {
		 *   console.log('people change: ' + attr + ', ' + how + ', ' + newVal + ', ' + oldVal);
		 * });
		 * 
		 * people.names.bind('change', function(ev, attr, how, newVal, oldVal) {
		 *    console.log('people.names change' + attr + ', ' + how + ', ' + newVal + ', ' + oldVal);
		 * });
		 * 
		 * people.bind('names', function(ev, newVal, oldVal) {
		 *     console.log('people names: ' + newVal + ', ' + oldVal);
		 * });
		 *
		 * people.names.bind('a', function(ev, newVal, oldVal) {
		 *     console.log('people.names a: ' + newVal + ', ' + oldVal);
		 * });
		 * 
		 * people.bind('names.a', function(ev, newVal, oldVal) {
		 *     console.log('people names.a: ' + newVal + ', ' + oldVal);
		 * });
		 * 
		 * people.attr('names.a', 'Alice'); // people change: names.a, add, Alice, undefined
		 *                                  // people.names change: a, add, Alice, undefined
		 *                                  // people.names a: Alice, undefined
		 *                                  // people names.a: Alice, undefined
		 * 
		 * people.names.attr('b', 'Bob');   // people change: names.b, add, Bob, undefined
		 *                                  // people.names change: b, add, Bob, undefined
		 *                                  // people.names b: Bob, undefined
		 *                                  // people names.b: Bob, undefined
		 * @codeend
		 * 
		 * ## See also
		 * 
		 * For information on the events that are fired on property changes and how
		 * to listen for those events, see [can.Observe.prototype.bind bind].
		 */
		attr: function( attr, val ) {
			// This is super obfuscated for space -- basically, we're checking
			// if the type of the attribute is not a `number` or a `string`.
			var type = typeof attr;
			if ( type !== "string" && type !== "number" ) {
				return this._attrs(attr, val)
			} else if ( arguments.length === 1 ) {// If we are getting a value.
				// Let people know we are reading.
				Observe.__reading && Observe.__reading(this, attr)
				return this._get(attr)
			} else {
				// Otherwise we are setting.
				this._set(attr, val);
				return this;
			}
		},
		/**
		 * @function can.Observe.prototype.each each
		 * @description Call a function on each property of an Observe.
		 * @signature `observe.each( callback(item, propName ) )`
		 * 
		 * `each` iterates through the Observe, calling a function
		 * for each property value and key.
		 * 
		 * @param {function(*,String)} callback(item,propName) the function to call for each property
		 * The value and key of each property will be passed as the first and second
		 * arguments, respectively, to the callback. If the callback returns false,
		 * the loop will stop.
		 * 
		 * @return {can.Observe} this Observe, for chaining
		 *
		 * @body
		 * @codestart
		 * var names = [];
		 * new can.Observe({a: 'Alice', b: 'Bob', e: 'Eve'}).each(function(value, key) {
		 *     names.push(value);
		 * });
		 * 
		 * names; // ['Alice', 'Bob', 'Eve']
		 * 
		 * names = [];
		 * new can.Observe({a: 'Alice', b: 'Bob', e: 'Eve'}).each(function(value, key) {
		 *     names.push(value);
		 *     if(key === 'b') {
		 *         return false;
		 *     }
		 * });
		 * 
		 * names; // ['Alice', 'Bob']
		 * 
		 * @codeend
		 */
		each: function() {
			Observe.__reading && Observe.__reading(this, '__keys');
			return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)))
		},
		/**
		 * @function can.Observe.prototype.removeAttr removeAttr
		 * @description Remove a property from an Observe.
		 * @signature `observe.removeAttr(attrName)`
		 * @param {String} attrName the name of the property to remove
		 * @return {*} the value of the property that was removed
		 * 
		 * @body
		 * `removeAttr` removes a property by name from an Observe.
		 * 
		 * @codestart
		 * var people = new can.Observe({a: 'Alice', b: 'Bob', e: 'Eve'});
		 * 
		 * people.removeAttr('b'); // 'Bob'
		 * people.attr();          // {a: 'Alice', e: 'Eve'}
		 * @codeend
		 * 
		 * Removing an attribute will cause a _change_ event to fire with `'remove'`
		 * passed as the _how_ parameter and `undefined` passed as the _newVal_ to
		 * handlers. It will also cause a _property name_ event to fire with `undefined`
		 * passed as _newVal_. An in-depth description at these events can be found
		 * under `[can.Observe.prototype.attr attr]`.
		 */
		removeAttr: function( attr ) {
				// Info if this is List or not
			var isList = this instanceof can.Observe.List,
				// Convert the `attr` into parts (if nested).
				parts = attrParts(attr),
				// The actual property to remove.
				prop = parts.shift(),
				// The current value.
				current = isList ? this[prop] : this._data[prop];

			// If we have more parts, call `removeAttr` on that part.
			if ( parts.length ) {
				return current.removeAttr(parts)
			} else {
				if(isList) {
					this.splice(prop, 1)
				} else if( prop in this._data ){
					// Otherwise, `delete`.
					delete this._data[prop];
					// Create the event.
					if (!(prop in this.constructor.prototype)) {
						delete this[prop]
					}
					// Let others know the number of keys have changed
					Observe.triggerBatch(this, "__keys");
					this._triggerChange(prop, "remove", undefined, current);

				}
				return current;
			}
		},
		// Reads a property from the `object`.
		_get: function( attr ) {
			var value = typeof attr === 'string' && !!~attr.indexOf('.') && this.__get(attr);
			if(value) {
				return value;
			}

			// break up the attr (`"foo.bar"`) into `["foo","bar"]`
			var parts = attrParts(attr),
				// get the value of the first attr name (`"foo"`)
				current = this.__get(parts.shift());
			// if there are other attributes to read
			return parts.length ? 
				// and current has a value
				current ?
					// lookup the remaining attrs on current
					current._get(parts) : 
					// or if there's no current, return undefined
					undefined 	
				: 
				// if there are no more parts, return current
				current;
		},
		// Reads a property directly if an `attr` is provided, otherwise
		// returns the "real" data object itself.
		__get: function( attr ) {
			return attr ? this._data[attr] : this._data;
		},
		// Sets `attr` prop as value on this object where.
		// `attr` - Is a string of properties or an array  of property values.
		// `value` - The raw value to set.
		_set: function( attr, value, keepKey) {
			// Convert `attr` to attr parts (if it isn't already).
			var parts = attrParts(attr, keepKey),
				// The immediate prop we are setting.
				prop = parts.shift(),
				// The current value.
				current = this.__get(prop);

			// If we have an `object` and remaining parts.
			if ( canMakeObserve(current) && parts.length ) {
				// That `object` should set it (this might need to call attr).
				current._set(parts, value)
			} else if (!parts.length ) {
				// We're in "real" set territory.
				if(this.__convert){
					value = this.__convert(prop, value)
				}
				this.__set(prop, value, current)
			} else {
				throw "can.Observe: Object does not exist"
			}
		},
		__set : function(prop, value, current){
		
			// Otherwise, we are setting it on this `object`.
			// TODO: Check if value is object and transform
			// are we changing the value.
			if ( value !== current ) {
				// Check if we are adding this for the first time --
				// if we are, we need to create an `add` event.
				var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

				// Set the value on data.
				this.___set(prop,

				// If we are getting an object.
				canMakeObserve(value) ?

				// Hook it up to send event.
				hookupBubble(value, prop, this) :
				// Value is normal.
				value);

				if(changeType == "add"){
					// If there is no current value, let others know that
					// the the number of keys have changed
					
					Observe.triggerBatch(this, "__keys", undefined);
					
				}
				// `batchTrigger` the change event.
				this._triggerChange(prop, changeType, value, current);
				
				//Observe.triggerBatch(this, prop, [value, current]);
				// If we can stop listening to our old value, do it.
				current && unhookup([current], this._cid);
			}

		},
		// Directly sets a property on this `object`.
		___set: function( prop, val ) {
			this._data[prop] = val;
			// Add property directly for easy writing.
			// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
			if (!(prop in this.constructor.prototype)) {
				this[prop] = val
			}
		},

		/**
		 * @function can.Observe.prototype.bind bind
		 * @description Bind event handlers to an Observe.
		 * 
		 * @signature `observe.bind(eventType, handler)`
		 * 
		 * @param {String} eventType the type of event to bind this handler to
		 * @param {Function} handler the handler to be called when this type of event fires
		 * The signature of the handler depends on the type of event being bound. See below
		 * for details.
		 * @return {can.Observe} this Observe, for chaining
		 * 
		 * @body
		 * `bind` binds event handlers to property changes on `can.Observe`s. When you change
		 * a property using `attr`, two events are fired on the Observe, allowing other parts
		 * of your application to observe the changes to the object.
		 *
		 * ## The _change_ event
		 * 
		 * The first event that is fired is the _change_ event. The _change_ event is useful
		 * if you want to react to all changes on an Observe.
		 *
		 * @codestart
		 * var o = new can.Observe({});
		 * o.bind('change', function(ev, attr, how, newVal, oldVal) {
		 *     console.log('Something changed.');
		 * });
		 * @codeend
		 * 
		 * The parameters of the event handler for the _change_ event are:
		 *
		 * - _ev_ The event object.
		 * - _attr_ Which property changed.
		 * - _how_ Whether the property was added, removed, or set. Possible values are `'add'`, `'remove'`, or `'set'`.
		 * - _newVal_ The value of the property after the change. `newVal` will be `undefined` if the property was removed.
		 * - _oldVal_ Thishe value of the property before the change. `oldVal` will be `undefined` if the property was added.
		 * 
		 * Here is a concrete tour through the _change_ event handler's arguments:
		 * 
		 * @codestart
		 * var o = new can.Observe({});
		 * o.bind('change', function(ev, attr, how, newVal, oldVal) {
		 *     console.log(ev + ', ' + attr + ', ' + how + ', ' + newVal + ', ' + oldVal);
		 * });
		 * 
		 * o.attr('a', 'Alexis'); // [object Object], a, add, Alexis, undefined
		 * o.attr('a', 'Adam');   // [object Object], a, set, Adam, Alexis
		 * o.attr({
		 *     'a': 'Alice',      // [object Object], a, set, Alice, Adam
		 *     'b': 'Bob'         // [object Object], b, add, Bob, undefined
		 * });
		 * o.removeAttr('a');     // [object Object], a, remove, undefined, Alice
		 * @codeend
		 *
		 * (See also `[can.Observe::removeAttr removeAttr]`, which removes properties).
		 * 
		 * ## The _property name_ event
		 * 
		 * The second event that is fired is an event whose type is the same as the changed
		 * property's name. This event is useful for noticing changes to a specific property.
		 *
		 * @codestart
		 * var o = new can.Observe({});
		 * o.bind('a', function(ev, newVal, oldVal) {
		 *     console.log('The value of a changed.');
		 * });
		 * @codeend
		 * 
		 * The parameters of the event handler for the _property name_ event are:
		 *
		 * - _ev_ The event object.
		 * - _newVal_ The value of the property after the change. `newVal` will be `undefined` if the property was removed.
		 * - _oldVal_ The value of the property before the change. `oldVal` will be `undefined` if the property was added.
		 * 
		 * Here is a concrete tour through the _property name_ event handler's arguments:
		 * 
		 * @codestart
		 * var o = new can.Observe({});
		 * o.bind('a', function(ev, newVal, oldVal) {
		 *     console.log(ev + ', ' + newVal + ', ' + oldVal);
		 * });
		 * 
		 * o.attr('a', 'Alexis'); // [object Object], Alexis, undefined
		 * o.attr('a', 'Adam');   // [object Object], Adam, Alexis
		 * o.attr({
		 *     'a': 'Alice',      // [object Object], Alice, Adam
		 *     'b': 'Bob' 
		 * });
		 * o.removeAttr('a');     // [object Object], undefined, Alice
		 * @codeend
		 *
		 * ## See also
		 * 
		 * More information about changing properties on Observes can be found under
		 * [can.Observe.prototype.attr attr].
		 * 
		 * For a more specific way to changes on Observes, see the [can.Observe.delegate] plugin.
		 */
		bind: can.bindAndSetup,
		/**
		 * @function can.Observe.prototype.unbind unbind
		 * @description Unbind event handlers from an Observe.
		 * @signature `observe.unbind(eventType[, handler])`
		 * @param {String} eventType the type of event to unbind, exactly as passed to `bind`
		 * @param {Function} [handler] the handler to unbind
		 *
		 * @body
		 * `unbind` unbinds event handlers previously bound with [can.Observe.prototype.bind|`bind`].
		 * If no _handler_ is passed, all handlers for the given event type will be unbound.
		 *
		 * @codestart
		 * var i = 0,
		 *     increaseBy2 = function() { i += 2; },
		 *     increaseBy3 = function() { i += 3; },
		 *     o = new can.Observe();
		 *
		 * o.bind('change', increaseBy2);
		 * o.bind('change', increaseBy3);
		 * o.attr('a', 'Alice');
		 * i; // 5
		 * 
		 * o.unbind('change', increaseBy2);
		 * o.attr('b', 'Bob');
		 * i; // 8
		 *
		 * o.unbind('change');
		 * o.attr('e', 'Eve');
		 * i; // 8
		 * @codeend
		 */
		unbind: can.unbindAndTeardown,
		/**
		 * @function can.Observe.prototype.serialize serialize
		 * @description Serialize this object to something that
		 * can be passed to `JSON.stringify`.
		 * @signature `observe.serialize()`
		 * 
		 * 
		 * Get the serialized Object form of the observe.  Serialized
		 * data is typically used to send back to a server.
		 * 
		 *     o.serialize() //-> { name: 'Justin' }
		 *     
		 * Serialize currently returns the same data 
		 * as [can.Observe.prototype.attrs].  However, in future
		 * versions, serialize will be able to return serialized
		 * data similar to [can.Model].  The following will work:
		 * 
		 *     new Observe({time: new Date()})
		 *       .serialize() //-> { time: 1319666613663 }
		 * 
		 * @return {Object} a JavaScript Object that can be 
		 * serialized with `JSON.stringify` or other methods. 
		 * 
		 */
		serialize: function() {
			return serialize(this, 'serialize', {});
		},
		/**
		 * @hide
		 * Set multiple properties on the observable
		 * @param {Object} props
		 * @param {Boolean} remove true if you should remove properties that are not in props
		 */
		_attrs: function( props, remove ) {

			if ( props === undefined ) {
				return serialize(this, 'attr', {})
			}

			props = can.extend({}, props);
			var prop,
				self = this,
				newVal;
			Observe.startBatch();
			this.each(function(curVal, prop){
				newVal = props[prop];

				// If we are merging...
				if ( newVal === undefined ) {
					remove && self.removeAttr(prop);
					return;
				}
				
				if(self.__convert){
					newVal = self.__convert(prop, newVal)
				}

				// if we're dealing with models, want to call _set to let converter run
				if( newVal instanceof can.Observe ) {
					self.__set(prop, newVal, curVal)
				// if its an object, let attr merge
				} else if ( canMakeObserve(curVal) && canMakeObserve(newVal) && curVal.attr ) {
					curVal.attr(newVal, remove)
				// otherwise just set
				} else if ( curVal != newVal ) {
					self.__set(prop, newVal, curVal)
				}

				delete props[prop];
			})
			// Add remaining props.
			for ( var prop in props ) {
				newVal = props[prop];
				this._set(prop, newVal, true)
			}
			Observe.stopBatch()
			return this;
		},

		/**
		 * @function can.Observe.prototype.compute compute
		 * @description Make a can.compute from an observable property.
		 * @signature `observe.compute(attrName)`
		 * @param {String} attrName the property to bind to
		 * @return {can.compute} a [can.compute] bound to _attrName_
		 *
		 * @body
		 * `compute` is a convenience method for making computes from properties
		 * of Observes. More information about computes can be found under [can.compute].
		 *
		 * @codestart
		 * var observe = new can.Observe({a: 'Alexis'});
		 * var name = observe.compute('a');
		 * name.bind('change', function(ev, nevVal, oldVal) {
		 *     console.log('a changed from ' + oldVal + 'to' + newName + '.');
		 * });
		 *
		 * name(); // 'Alexis'
		 * 
		 * observe.attr('a', 'Adam'); // 'a changed from Alexis to Adam.'
		 * name(); // 'Adam'
		 *
		 * name('Alice'); // 'a changed from Adam to Alice.'
		 * name(); // 'Alice'
		 */
		compute: function(prop) {
			return can.compute(this,prop);
		}
	});
	// Helpers for `observable` lists.
	var splice = [].splice,
		/**
		 * @constructor can.Observe.List
		 * @inherits can.Observe
		 * @download can/observe
		 * @test can/observe/qunit.html
		 * @parent canjs
		 * 
		 * Use for observable array-like objects.
		 * 
		 * @signature `new can.Observe.List([array])`
		 * 
		 * Create an observable array-like object.
		 * 
		 * @param {Array} [array] items to seed the List with
		 * @return {can.Observe.List} an instance of `can.Observe.List` with the elements from _array_
		 * 
		 * @signature `can.Observe.List([name,] [staticProperties,] instanceProperties)`
		 * 
		 * Creates a new extended constructor function. 
		 *     
		 * This is deprecated. In CanJS 1.2, by default, calling the constructor function
		 * without `new` will create a `new` instance. Use [can.Construct.extend can.Observe.extend] 
		 * instead of calling the constructor to extend.
		 * 
		 * @body
		 * 
		 * ## Working with Lists
		 *
		 * `can.Observe.List` extends `[can.Observe]`, so all the ways that you're used to working with
		 * Observes also work here, including [can.Observe.prototype.bind bind], [can.Observe.prototype.unbind unbind],
		 * and [can.Observe.prototype.each each]. And just as you can directly read properties normally
		 * off of an Observe, you can use array accessors ([]) to read elements directly off of a List.
		 *
		 * The one function of `can.Observe` that works slightly differently is `attr`. As expected when working with
		 * arrays, top-level keys passed into `attr` are required to be numeric. (Strings may still be used when getting
		 * or modifying deep properties). Any top-level keys that are non-numeric are ignored. In addition, as might be
		 * expected, a call to argument-less `attr` returns an array instead of an object.
		 *
		 * Just as you shouldn't set properties of an Observe directly, you shouldn't change elements
		 * of a List directly. Always use `attr` to set the elements of a List, or use [can.Observe.List.push push],
		 * [can.Observe.List.pop pop], [can.Observe.List.shift shift], [can.Observe.List.unshift unshift], or [can.Observe.List.splice splice].
		 *
		 * Here is a tour through the forms of `can.Observe.List`'s `attr` that parallels the one found under [can.Observe.prototype.attr attr]:
		 *
		 * @codestart
		 * var people = new can.Observe.List(['Alex', 'Bill']);
		 *
		 * // set an element:
		 * people.attr(0, 'Adam');
		 * people[0] = 'Adam'; // don't do this!
		 *
		 * // get an element:
		 * people.attr(0); // 'Adam'
		 * people[0]; // 'Adam'
		 *
		 * // get all elements:
		 * people.attr(); // ['Adam', 'Bill']
		 *
		 * // extend the array:
		 * people.attr(4, 'Charlie');
		 * people.attr(); // ['Adam', 'Bill', undefined, undefined, 'Charlie']
		 *
		 * // merge the elements:
		 * people.attr(['Alice', 'Bob', 'Eve']);
		 * people.attr(); // ['Alice', 'Bob', 'Eve', undefined, 'Charlie']
		 * @codeend
		 *
		 * ## Listening to changes
		 *
		 * As with `can.Observe`s, the real power of observable arrays comes from being able to
		 * react to changes in the member elements of the array. Lists emit five types of events:
		 * - the _change_ event fires on every change to a List.
		 * - the _set_ event is fired when an element is set.
		 * - the _add_ event is fired when an element is added to the List.
		 * - the _remove_ event is fired when an element is removed from the List.
		 * - the _length_ event is fired when the length of the List changes.
		 *
		 * This example presents a brief concrete survey of the times these events are fired:
		 *
		 * @codestart
		 * var list = new can.Observe.List(['Alice', 'Bob', 'Eve']);
		 *
		 * list.bind('change', function() { console.log('An element changed.'); });
		 * list.bind('set', function() { console.log('An element was set.'); });
		 * list.bind('add', function() { console.log('An element was added.'); });
		 * list.bind('remove', function() { console.log('An element was removed.'); });
		 * list.bind('length', function() { console.log('The length of the list changed.'); });
		 *
		 * list.attr(0, 'Alexis'); // 'An element changed.'
		 *                         // 'An element was set.'
		 *
		 * list.attr(3, 'Xerxes'); // 'An element changed.'
		 *                         // 'An element was added.'
		 *                         // 'The length of the list was changed.'
		 *
		 * list.attr(['Adam', 'Bill']); // 'An element changed.'
		 *                              // 'An element was set.'
		 *                              // 'An element was changed.'
		 *                              // 'An element was set.'
		 *
		 * list.pop(); // 'An element changed.'
		 *             // 'An element was removed.'
		 *             // 'The length of the list was changed.'
		 * @codeend
		 *
		 * More information about binding to these events can be found under [can.Observe.List.attr attr].
		 */
			list = Observe(
	/**
	 * @prototype
	 */
	{
		setup: function( instances, options ) {
			this.length = 0;
			can.cid(this, ".observe")
			this._init = 1;
			if( can.isDeferred(instances) ) {
				this.replace(instances)
			} else {
				this.push.apply(this, can.makeArray(instances || []));
			}
			// this change needs to be ignored
			this.bind('change'+this._cid,can.proxy(this._changes,this));
			can.extend(this, options);
			delete this._init;
		},
		_triggerChange: function(attr, how, newVal, oldVal){
			
			Observe.prototype._triggerChange.apply(this,arguments)
			// `batchTrigger` direct add and remove events...
			if ( !~ attr.indexOf('.')){
				
				if( how === 'add' ) {
					Observe.triggerBatch(this, how, [newVal,+attr]);
					Observe.triggerBatch(this,'length',[this.length]);
				} else if( how === 'remove' ) {
					Observe.triggerBatch(this, how, [oldVal, +attr]);
					Observe.triggerBatch(this,'length',[this.length]);
				} else {
					Observe.triggerBatch(this,how,[newVal, +attr])
				}
				
			}
			
		},
		__get : function(attr){
			return attr ? this[attr] : this;
		},
		___set : function(attr, val){
			this[attr] = val;
			if(+attr >= this.length){
				this.length = (+attr+1)
			}
		},
		_each: function(callback){
			var data = this.__get();
			for(var i =0; i < data.length; i++){
				callback(data[i],i)
			}
		},
		_bindsetup: makeBindSetup("*"),
		// Returns the serialized form of this list.
		/**
		 * @hide
		 * Returns the serialized form of this list.
		 */
		serialize: function() {
			return serialize(this, 'serialize', []);
		},
		/**
		 * @function can.Observe.List.prototype.each each
		 * @description Call a function on each element of a List.
		 * @signature `list.each( callback(item, index) )`
		 * 
		 * `each` iterates through the Observe, calling a function
		 * for each element.
		 * 
		 * @param {function(*, Number)} callback the function to call for each element
		 * The value and index of each element will be passed as the first and second
		 * arguments, respectively, to the callback. If the callback returns false,
		 * the loop will stop.
		 * 
		 * @return {can.Observe.List} this List, for chaining
		 *
		 * @body
		 * @codestart
		 * var i = 0;
		 * new can.Observe([1, 10, 100]).each(function(element, index) {
		 *     i += element;
		 * });
		 * 
		 * i; // 111
		 * 
		 * i = 0;
		 * new can.Observe([1, 10, 100]).each(function(element, index) {
		 *     i += element;
		 *     if(index >= 1) {
		 *         return false;
		 *     }
		 * });
		 * 
		 * i; // 11
		 * @codeend
		 */
		//  
		/**
		 * @function can.Observe.List.prototype.splice splice
		 * @description Insert and remove elements from a List.
		 * @signature `list.splice(index[, howMany[, ...newElements]])`
		 * @param {Number} index where to start removing or inserting elements
		 * 
		 * @param {Number} [howMany] the number of elements to remove
		 * If _howMany_ is not provided, `splice` will all elements from `index` to the end of the List.
		 *
		 * @param {*} newElements elements to insert into the List
		 *
		 * @return {Array} the elements removed by `splice`
		 *
		 * @body
		 * `splice` lets you remove elements from and insert elements into a List.
		 *
		 * This example demonstrates how to do surgery on a list of numbers:
		 * 
		 * @codestart
		 * var list = new can.Observe.List([0, 1, 2, 3]);
		 *
		 * // starting at index 2, remove one element and insert 'Alice' and 'Bob':
		 * list.splice(2, 1, 'Alice', 'Bob');
		 * list.attr(); // [0, 1, 'Alice', 'Bob', 3]
		 * @codeend
		 *
		 * ## Events
		 *
		 * `splice` causes the List it's called on to emit _change_ events,
		 * _add_ events, _remove_ events, and _length_ events. If there are
		 * any elements to remove, a _change_ event, a _remove_ event, and a
		 * _length_ event will be fired. If there are any elements to insert, a
		 * separate _change_ event, an _add_ event, and a separate _length_ event
		 * will be fired. 
		 *
		 * This slightly-modified version of the above example should help
		 * make it clear how `splice` causes events to be emitted:
		 *
		 * @codestart
		 * var list = new can.Observe.List(['a', 'b', 'c', 'd']);
		 * list.bind('change', function(ev, attr, how, newVals, oldVals) {
	     *     console.log('change: ' + attr + ', ' + how + ', ' + newVals + ', ' + oldVals);
		 * });
		 * list.bind('add', function(ev, newVals, where) {
	     *     console.log('add: ' + newVals + ', ' + where);
		 * });
		 * list.bind('remove', function(ev, oldVals, where) {
	     *     console.log('remove: ' + oldVals + ', ' + where);
		 * });
		 * list.bind('length', function(ev, length) {
	     *     console.log('length: ' + length + ', ' + this.attr());
		 * });
		 *
		 * // starting at index 2, remove one element and insert 'Alice' and 'Bob':
		 * list.splice(2, 1, 'Alice', 'Bob'); // change: 2, 'remove', undefined, ['c']
		 *                                    // remove: ['c'], 2
		 *                                    // length: 5, ['a', 'b', 'Alice', 'Bob', 'd']
		 *                                    // change: 2, 'add', ['Alice', 'Bob'], ['c']
		 *                                    // add: ['Alice', 'Bob'], 2
		 *                                    // length: 5, ['a', 'b', 'Alice', 'Bob', 'd']
		 * @codeend
		 *
		 * More information about binding to these events can be found under [can.Observe.List.attr attr].
		 */
		splice: function( index, howMany ) {
			var args = can.makeArray(arguments),
				i;

			for ( i = 2; i < args.length; i++ ) {
				var val = args[i];
				if ( canMakeObserve(val) ) {
					args[i] = hookupBubble(val, "*", this, this.constructor.Observe, this.constructor)
				}
			}
			if ( howMany === undefined ) {
				howMany = args[1] = this.length - index;
			}
			var removed = splice.apply(this, args);
			can.Observe.startBatch();
			if ( howMany > 0 ) {
				this._triggerChange(""+index, "remove", undefined, removed);
				unhookup(removed, this._cid);
			}
			if ( args.length > 2 ) {
				this._triggerChange(""+index, "add", args.slice(2), removed);
			}
			can.Observe.stopBatch();
			return removed;
		},
		/**
		 * @description Get or set elements in a List.
		 * @function can.Observe.List.prototype.attr attr
		 * @signature `list.attr()`
		 * 
		 * Gets a collection of all the elements in this `can.Observe.List`.
		 * 
		 * @return {Array} array with all the elements in this List.
		 * 
		 * @signature `list.attr(index)`
		 * 
		 * Reads a element from this `can.Observe.List`.
		 * 
		 * @param {Number} index the element to read
		 * @return {*} the value at _index_.
		 *
		 * @signature `list.attr(index, value)`
		 * 
		 * Assigns _value_ to the index _index_ on this `can.Observe.List`, expanding the list if necessary.
		 * 
		 * @param {Number} index the element to set
		 * @param {*} the value to assign at _index_
		 * @return {can.Observe.List} this List, for chaining
		 * 
		 * @signature `list.attr(elements[, replaceCompletely])`
		 * 
		 * Merges the members of _elements_ into this List, replacing each from the beginning in order. If
		 * _elements_ is longer than the current List, the current List will be expanded. If _elements_
		 * is shorter than the current List, the extra existing members are not affected (unless
		 * _replaceCompletely_ is `true`). To remove elements without replacing them, use `[can.Observe.List.prototype.removeAttr removeAttr]`.
		 * 
		 * @param {Array} elements an array of elements to merge in
		 *
		 * @param {bool} [replaceCompletely=false] whether to completely replace the elements of List
		 * If _replaceCompletely_ is `true` and _elements_ is shorter than the List, the existing
		 * extra members of the List will be removed.
		 *
		 * @return {can.Observe.List} this List, for chaining
		 * 
		 * @body
		 * `attr` gets or sets elements on the `can.Observe.List` it's called on. Here's a tour through
		 * how all of its forms work:
		 *
		 * @codestart
		 * var people = new can.Observe.List(['Alex', 'Bill']);
		 * 
		 * // set an element:
		 * people.attr(0, 'Adam');
		 * 
		 * // get an element:
		 * people.attr(0); // 'Adam'
		 * people[0]; // 'Adam'
		 *
		 * // get all elements:
		 * people.attr(); // ['Adam', 'Bill']
		 *
		 * // extend the array:
		 * people.attr(4, 'Charlie');
		 * people.attr(); // ['Adam', 'Bill', undefined, undefined, 'Charlie']
		 *
		 * // merge the elements:
		 * people.attr(['Alice', 'Bob', 'Eve']);
		 * people.attr(); // ['Alice', 'Bob', 'Eve', undefined, 'Charlie']
		 * @codeend
		 * 
		 * ## Deep properties
		 * 
		 * `attr` can also set and read deep properties. All you have to do is specify
		 * the property name as you normally would if you weren't using `attr`.
		 * 
		 * @codestart
		 * var people = new can.Observe.List([{name: 'Alex'}, {name: 'Bob'}]);
		 * 
		 * // set a property:
		 * people.attr('0.name', 'Alice');
		 * 
		 * // get a property:
		 * people.attr('0.name');  // 'Alice'
		 * people[0].attr('name'); // 'Alice'
		 *
		 * // get all properties:
		 * people.attr(); // [{name: 'Alice'}, {name: 'Bob'}]
		 * @codeend
		 *
		 * The discussion of deep properties under `[can.Observe.prototype.attr]` may also
		 * be enlightening.
		 *
		 * ## Events
		 *
		 * `can.Observe.List`s emit five types of events in response to changes. They are:
		 * - the _change_ event fires on every change to a List.
		 * - the _set_ event is fired when an element is set.
		 * - the _add_ event is fired when an element is added to the List.
		 * - the _remove_ event is fired when an element is removed from the List.
		 * - the _length_ event is fired when the length of the List changes.
		 *
		 * * ## The _change_ event
		 * 
		 * The first event that is fired is the _change_ event. The _change_ event is useful
		 * if you want to react to all changes on an List.
		 *
		 * @codestart
		 * var list = new can.Observe.List([]);
		 * list.bind('change', function(ev, index, how, newVal, oldVal) {
		 *     console.log('Something changed.');
		 * });
		 * @codeend
		 * 
		 * The parameters of the event handler for the _change_ event are:
		 *
		 * - _ev_ The event object.
		 * - _index_ Where the change took place.
		 * - _how_ Whether elements were added, removed, or set.
		 * Possible values are `'add'`, `'remove'`, or `'set'`.
		 * - _newVal_ The elements affected after the change
		 *  _newVal_ will be a single value when an index is set, an Array when elements
		 * were added, and `undefined` if elements were removed.
		 * - _oldVal_ The elements affected before the change.
		 * _newVal_ will be a single value when an index is set, an Array when elements
		 * were removed, and `undefined` if elements were added.
		 * 
		 * Here is a concrete tour through the _change_ event handler's arguments:
		 * 
		 * @codestart
		 * var list = new can.Observe.List();
		 * list.bind('change', function(ev, index, how, newVal, oldVal) {
		 *     console.log(ev + ', ' + index + ', ' + how + ', ' + newVal + ', ' + oldVal);
		 * });
		 * 
		 * list.attr(['Alexis', 'Bill']); // [object Object], 0, add, ['Alexis', 'Bill'], undefined
		 * list.attr(2, 'Eve');           // [object Object], 2, add, Eve, undefined
		 * list.attr(0, 'Adam');          // [object Object], 0, set, Adam, Alexis
		 * list.attr(['Alice', 'Bob']);   // [object Object], 0, set, Alice, Adam
		 *                                // [object Object], 1, set, Bob, Bill
		 * list.removeAttr(1);            // [object Object], 1, remove, undefined, Bob
		 * @codeend
		 *
		 * ## The _set_ event
		 * 
		 * _set_ events are fired when an element at an index that already exists in the List is
		 * modified. Actions can cause _set_ events to fire never also cause _length_ events
		 * to fire (although some functions, such as `[can.Observe.List.prototype.splice splice]`
		 * may cause unrelated sets of events to fire after being batched).
		 * 
		 * The parameters of the event handler for the _set_ event are:
		 *
		 * - _ev_ The event object.
		 * - _newVal_ The new value of the element.
		 * - _index_ where the set took place.
		 *
		 * Here is a concrete tour through the _set_ event handler's arguments:
		 * 
		 * @codestart
		 * var list = new can.Observe.List();
		 * list.bind('set', function(ev, newVal, index) {
		 *     console.log(newVal + ', ' + index);
		 * });
		 * 
		 * list.attr(['Alexis', 'Bill']);
		 * list.attr(2, 'Eve');          
		 * list.attr(0, 'Adam');          // Adam, 0
		 * list.attr(['Alice', 'Bob']);   // Alice, 0
		 *                                // Bob, 1
		 * list.removeAttr(1);            
		 * @codeend
		 *
		 * ## The _add_ event
		 * 
		 * _add_ events are fired when elements are added or inserted
		 * into the List.
		 * 
		 * The parameters of the event handler for the _add_ event are:
		 *
		 * - _ev_ The event object.
		 * - _newElements_ The new elements.
		 * If more than one element is added, _newElements_ will be an array.
		 * Otherwise, it is simply the new element itself.
		 * - _index_ Where the add or insert took place.
		 *
		 * Here is a concrete tour through the _add_ event handler's arguments:
		 * 
		 * @codestart
		 * var list = new can.Observe.List();
		 * list.bind('add', function(ev, newElements, index) {
		 *     console.log(newElements + ', ' + index);
		 * });
		 * 
		 * list.attr(['Alexis', 'Bill']); // ['Alexis', 'Bill'], 0
		 * list.attr(2, 'Eve');           // Eve, 2
		 * list.attr(0, 'Adam');          
		 * list.attr(['Alice', 'Bob']);   
		 *                                
		 * list.removeAttr(1);            
		 * @codeend
		 *
		 * ## The _remove_ event
		 * 
		 * _remove_ events are fired when elements are removed from the list.
		 * 
		 * The parameters of the event handler for the _remove_ event are:
		 *
		 * - _ev_ The event object.
		 * - _removedElements_ The removed elements.
		 * If more than one element was removed, _removedElements_ will be an array.
		 * Otherwise, it is simply the element itself.
		 * - _index_ Where the removal took place.
		 *
		 * Here is a concrete tour through the _remove_ event handler's arguments:
		 * 
		 * @codestart
		 * var list = new can.Observe.List();
		 * list.bind('remove', function(ev, removedElements, index) {
		 *     console.log(removedElements + ', ' + index);
		 * });
		 * 
		 * list.attr(['Alexis', 'Bill']); 
		 * list.attr(2, 'Eve');           
		 * list.attr(0, 'Adam');          
		 * list.attr(['Alice', 'Bob']);   
		 *                                
		 * list.removeAttr(1);            // Bob, 1
		 * @codeend
		 *
		 * ## The _length_ event
		 * 
		 * _length_ events are fired whenever the list changes.
		 * 
		 * The parameters of the event handler for the _length_ event are:
		 *
		 * - _ev_ The event object.
		 *- _length_ The current length of the list.
		 * If events were batched when the _length_ event was triggered, _length_
		 * will have the length of the list when `stopBatch` was called. Because
		 * of this, you may recieve multiple _length_ events with the same
		 * _length_ parameter.
		 * 
		 * Here is a concrete tour through the _length_ event handler's arguments:
		 * 
		 * @codestart
		 * var list = new can.Observe.List();
		 * list.bind('length', function(ev, length) {
		 *     console.log(length);
		 * });
		 * 
		 * list.attr(['Alexis', 'Bill']); // 2
		 * list.attr(2, 'Eve');           // 3
		 * list.attr(0, 'Adam');          
		 * list.attr(['Alice', 'Bob']);   
		 *                                
		 * list.removeAttr(1);            // 2
		 * @codeend
		 */
		_attrs: function( items, remove ) {
			if ( items === undefined ) {
				return serialize(this, 'attr', []);
			}

			// Create a copy.
			items = can.makeArray( items );

      		Observe.startBatch();
			this._updateAttrs(items, remove);
			Observe.stopBatch()
		},

	    _updateAttrs : function( items, remove ){
	      var len = Math.min(items.length, this.length);
	
	      for ( var prop = 0; prop < len; prop++ ) {
	        var curVal = this[prop],
	          newVal = items[prop];
	
	        if ( canMakeObserve(curVal) && canMakeObserve(newVal) ) {
	          curVal.attr(newVal, remove)
	        } else if ( curVal != newVal ) {
	          this._set(prop, newVal)
	        } else {
	
	        }
	      }
	      if ( items.length > this.length ) {
	        // Add in the remaining props.
	        this.push.apply( this, items.slice( this.length ) );
	      } else if ( items.length < this.length && remove ) {
	        this.splice(items.length)
	      }
	    }
	}),


		// Converts to an `array` of arguments.
		getArgs = function( args ) {
			return args[0] && can.isArray(args[0]) ?
				args[0] :
				can.makeArray(args);
		};
	// Create `push`, `pop`, `shift`, and `unshift`
	can.each({
		/**
		 * @function can.Observe.List.prototype.push push
		 * @description Add elements to the end of a list.
		 * @signature `list.push(...elements)`
		 *
		 * `push` adds elements onto the end of a List.]
		 * 
		 * @param {*} elements the elements to add to the List
		 *
		 * @return {Number} the new length of the List
		 *
		 * @body
		 * `push` is fairly straightforward:
		 *
		 * @codestart
		 * var list = new can.Observe.List(['Alice']);
		 *
		 * list.push('Bob', 'Eve');
		 * list.attr(); // ['Alice', 'Bob', 'Eve']
		 * @codeend
		 *
		 * If you have an array you want to concatenate to the end
		 * of the List, you can use `apply`:
		 *
		 * @codestart
		 * var names = ['Bob', 'Eve'],
		 *     list = new can.Observe.List(['Alice']);
		 *
		 * list.push.apply(list, names);
		 * list.attr(); // ['Alice', 'Bob', 'Eve']
		 * @codeend
		 *
		 * ## Events
		 *
		 * `push` causes _change_, _add_, and _length_ events to be fired.
		 *
		 * ## See also
		 *
		 * `push` has a counterpart in [can.Observe.List.pop pop], or you may be
		 * looking for [can.Observe.List.unshift unshift] and its counterpart [can.Observe.List.shift shift].
		 */
		push: "length",
		/**
		 * @function can.Observe.List.prototype.unshift unshift
		 * @description Add elements to the beginning of a List.
		 * @signature `list.unshift(...elements)`
		 *
		 * `unshift` adds elements onto the beginning of a List.
		 * 
		 * @param {*} elements the elements to add to the List
		 *
		 * @return {Number} the new length of the List
		 *
		 * @body
		 * `unshift` adds elements to the front of the list in bulk in the order specified:
		 *
		 * @codestart
		 * var list = new can.Observe.List(['Alice']);
		 *
		 * list.unshift('Bob', 'Eve');
		 * list.attr(); // ['Bob', 'Eve', 'Alice']
		 * @codeend
		 *
		 * If you have an array you want to concatenate to the beginning
		 * of the List, you can use `apply`:
		 *
		 * @codestart
		 * var names = ['Bob', 'Eve'],
		 *     list = new can.Observe.List(['Alice']);
		 *
		 * list.push.apply(list, names);
		 * list.attr(); // ['Bob', 'Eve', 'Alice']
		 * @codeend
		 *
		 * ## Events
		 *
		 * `unshift` causes _change_, _add_, and _length_ events to be fired.
		 *
		 * ## See also
		 *
		 * `unshift` has a counterpart in [can.Observe.List.shift shift], or you may be
		 * looking for [can.Observe.List.push push] and its counterpart [can.Observe.List.pop pop].
		 */
		unshift: 0
	},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.
	function( where, name ) {
		var orig = [][name]
		list.prototype[name] = function() {
			// Get the items being added.
			var args = [],
				// Where we are going to add items.
				len = where ? this.length : 0,
				i = arguments.length,
				res,
				val,
				constructor = this.constructor;

			// Go through and convert anything to an `observe` that needs to be converted.
			while(i--){
				val = arguments[i];
				args[i] =  canMakeObserve(val) ?
					hookupBubble(val, "*", this, this.constructor.Observe, this.constructor) :
					val;
			}
			
			// Call the original method.
			res = orig.apply(this, args);

			if ( !this.comparator || args.length ) {

				this._triggerChange(""+len, "add", args, undefined);
			}
						
			return res;
		}
	});

	can.each({
		/**
		 * @function can.Observe.List.prototype.pop pop
		 * @description Remove an element from the end of a List.
		 * @signature `list.pop()`
		 *
		 * `push` removes an element from the end of a List.
		 * 
		 * @return {*} the element just popped off the List, or `undefined` if the List was empty
		 *
		 * @body
		 * `pop` is the opposite action from `[can.Observe.List.push push]`:
		 *
		 * @codestart
		 * var list = new can.Observe.List(['Alice']);
		 *
		 * list.push('Bob', 'Eve');
		 * list.attr(); // ['Alice', 'Bob', 'Eve']
		 * 
		 * list.pop(); // 'Eve'
		 * list.pop(); // 'Bob'
		 * list.pop(); // 'Alice'
		 * list.pop(); // undefined
		 * @codeend
		 *
		 * ## Events
		 *
		 * `pop` causes _change_, _remove_, and _length_ events to be fired if the List is not empty
		 * when it is called.
		 *
		 * ## See also
		 *
		 * `pop` has its counterpart in [can.Observe.List.push push], or you may be
		 * looking for [can.Observe.List.unshift unshift] and its counterpart [can.Observe.List.shift shift].
		 */
		pop: "length",
		/**
		 * @function can.Observe.List.prototype.shift shift
		 * @description Remove en element from the front of a list.
		 * @signature `list.shift()`
		 *
		 * `shift` removes an element from the beginning of a List.
		 *
		 * @return {*} the element just shifted off the List, or `undefined` if the List is empty
		 *
		 * @body
		 * `shift` is the opposite action from `[can.Observe.List.unshift unshift]`:
		 *
		 * @codestart
		 * var list = new can.Observe.List(['Alice']);
		 *
		 * list.unshift('Bob', 'Eve');
		 * list.attr(); // ['Bob', 'Eve', 'Alice']
		 *
		 * list.shift(); // 'Bob'
		 * list.shift(); // 'Eve'
		 * list.shift(); // 'Alice'
		 * list.shift(); // undefined
		 * @codeend
		 *
		 * ## Events
		 *
		 * `pop` causes _change_, _remove_, and _length_ events to be fired if the List is not empty
		 * when it is called.
		 *
		 * ## See also
		 *
		 * `shift` has a counterpart in [can.Observe.List.unshift unshift], or you may be
		 * looking for [can.Observe.List.push push] and its counterpart [can.Observe.List.pop pop].
		 */
		shift: 0
	},
	// Creates a `remove` type method
	function( where, name ) {
		list.prototype[name] = function() {
			
			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;


			var res = [][name].apply(this, args)

			// Create a change where the args are
			// `len` - Where these items were removed.
			// `remove` - Items removed.
			// `undefined` - The new values (there are none).
			// `res` - The old, removed values (should these be unbound).
			this._triggerChange(""+len, "remove", undefined, [res])

			if ( res && res.unbind ) {
				res.unbind("change" + this._cid)
			}
			return res;
		}
	});
	
	can.extend(list.prototype, {
		/**
		 * @function can.Observe.List.prototype.indexOf indexOf
		 * @description Look for an item in a List.
		 * @signature `list.indexOf(item)`
		 *
		 * `indexOf` finds the position of a given item in the List.
		 *
		 * @param {*} item the item to find
		 *
		 * @return {Number} the position of the item in the List, or -1 if the item is not found.
		 *
		 * @body
		 * @codestart
		 * var list = new can.Observe.List(['Alice', 'Bob', 'Eve']);
		 * list.indexOf('Alice');   // 0
		 * list.indexOf('Charlie'); // -1
		 * @codeend
		 *
		 * It is trivial to make a `contains`-type function using `indexOf`:
		 *
		 * @codestart
		 * function(list, item) {
		 *     return list.indexOf(item) >= 0;
		 * }
		 * @codeend
		 */
		indexOf: function(item) {
			this.attr('length')
			return can.inArray(item, this)
		},

		/**
		 * @function can.Observe.List.prototype.join join
		 * @description Join a List's elements into a string.
		 * @signature `list.join(separator)`
		 *
		 * `join` turns a List into a string by inserting _separator_ between the string representations
		 * of all the elements of the List.
		 *
		 * @param {String} separator the string to seperate elements with
		 *
		 * @return {String} the joined string
		 *
		 * @body
		 * @codestart
		 * var list = new can.Observe.List(['Alice', 'Bob', 'Eve']);
		 * list.join(', '); // 'Alice, Bob, Eve'
		 *
		 * var beatles = new can.Observe.List(['John', 'Paul', 'Ringo', 'George']);
		 * beatles.join('&'); // 'John&Paul&Ringo&George'
		 * @codeend
		 */
		join : [].join,
		
		/**
		 * @function can.Observe.List.prototype.reverse reverse
		 * @description Reverse the order of a List.
		 * @signature `list.reverse()`
		 *
		 * `reverse` reverses the elements of the List in place.
		 *
		 * @return {can.Observe.List} the List, for chaining
		 *
		 * @body
		 * @codestart
		 * var list = new can.Observe.List(['Alice', 'Bob', 'Eve']);
		 * var reversedList = list.reverse();
		 *
		 * reversedList.attr(); // ['Eve', 'Bob', 'Alice'];
		 * list === reversedList; // true
		 * @codeend
		 */
		reverse: [].reverse,

		/**
		 * @function can.Observe.List.prototype.slice slice
		 * @description Make a copy of a part of a List.
		 * @signature `list.slice([start[, end]])`
		 *
		 * `slice` creates a copy of a portion of the List.
		 *
		 * @param {Number} [start=0] the index to start copying from
		 *
		 * @param {Number} [end] the first index not to include in the copy
		 * If _end_ is not supplied, `slice` will copy until the end of the list.
		 *
		 * @return {can.Observe.List} a new `can.Observe.List` with the extracted elements
		 *
		 * @body
		 * @codestart
		 * var list = new can.Observe.List(['Alice', 'Bob', 'Charlie', 'Daniel', 'Eve']);
		 * var newList = list.slice(1, 4);
		 * newList.attr(); // ['Bob', 'Charlie', 'Daniel']
		 * @codeend
		 *
		 * `slice` is the simplest way to copy a List:
		 * 
		 * @codestart
		 * var list = new can.Observe.List(['Alice', 'Bob', 'Eve']);
		 * var copy = list.slice();
		 *
		 * copy.attr();   // ['Alice', 'Bob', 'Eve']
		 * list === copy; // false
		 * @codeend
		 */
		slice : function() {
			var temp = Array.prototype.slice.apply(this, arguments);
			return new this.constructor( temp );
		},

		/**
		 * @function can.Observe.List.prototype.concat concat
		 * @description Merge many collections together into a List.
		 * @signature `list.concat(...args)`
		 * @param {Array|can.Observe.List|*} args Any number of arrays, Lists, or values to add in
		 * For each parameter given, if it is an Array or a List, each of its elements will be added to
		 * the end of the concatenated List. Otherwise, the parameter itself will be added.
		 *
		 * @body
		 * `concat` makes a new List with the elements of the List followed by the elements of the parameters.
		 *
		 * @codestart
		 * var list = new can.Observe.List();
		 * var newList = list.concat(
		 *     'Alice',
		 *     ['Bob', 'Charlie']),
		 *     new can.Observe.List(['Daniel', 'Eve']),
		 *     {f: 'Francis'}
		 * );
		 * newList.attr(); // ['Alice', 'Bob', 'Charlie', 'Daniel', 'Eve', {f: 'Francis'}]
		 * @codeend
		 */
		concat : function() {
			var args = [];
			can.each( can.makeArray( arguments ), function( arg, i ) {
				args[i] = arg instanceof can.Observe.List ? arg.serialize() : arg ;
			});
			return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
		},

		/**
		 * @function can.Observe.List.prototype.forEach forEach
		 * @description Call a function for each element of a List.
		 * @signature `list.forEach(callback[, thisArg])`
		 * @param {function(element, index, list)} callback a function to call with each element of the List
		 * The three parameters that _callback_ gets passed are _element_, the element at _index_, _index_ the
		 * current element of the list, and _list_ the List the elements are coming from.
		 * @param {Object} [thisArg] the object to use as `this` inside the callback
		 *
		 * @body
		 * `forEach` calls a callback for each element in the List.
		 *
		 * @codestart
		 * var list = new can.Observe.List([1, 2, 3]);
		 * list.forEach(function(element, index, list) {
		 *     list.attr(index, element * element);
		 * });
		 * list.attr(); // [1, 4, 9]
		 * @codeend
		 */
		forEach : function( cb, thisarg ) {
			can.each(this, cb, thisarg || this );
		},

		/**
		 * @function can.Observe.List.prototype.replace replace
		 * @description Replace all the elements of a List.
		 * @signature `list.replace(collection)`
		 * @param {Array|can.Observe.List|can.Deferred} collection the collection of new elements to use
		 * If a [can.Deferred] is passed, it must resolve to an `Array` or `can.Observe.List`.
		 * The elements of the list are not actually removed until the Deferred resolves.
		 *
		 * @body
		 * `replace` replaces all the elements of this List with new ones.
		 *
		 * `replace` is especially useful when `can.Observe.List`s are live-bound into `[can.Control]`s,
		 * and you intend to populate them with the results of a `[can.Model]` call:
		 *
		 * @codestart
		 * can.Control({
		 *     init: function() {
		 *         this.list = new Todo.List();
		 *         // live-bind the list into the DOM
		 *         this.element.html(can.view('list.mustache', this.list));
		 *         // when this AJAX call returns, the live-bound DOM will be updated
		 *         this.list.replace(Todo.findAll());
		 *     }
		 * });
		 * @codeend
		 *
		 * Learn more about [can.Model.List making Lists of models].
		 *
		 * ## Events
		 * 
		 * A major difference between `replace` and `attr(newElements, true)` is that `replace` always emits
		 * an_add_ event and a _remove_ event, whereas `attr` will cause _set_ events along an _add_ or _remove_
		 * event if needed. Corresponding _change_ and _length_ events will be fired as well.
		 *
		 * The differences in the events fired by `attr` and `replace` are demonstrated concretely by this example:
		 * @codestart
		 * var attrList = new can.Observe.List(['Alexis', 'Bill']);
		 * attrList.bind('change', function(ev, index, how, newVals, oldVals) {
		 *     console.log(index + ', ' + how + ', ' + newVals + ', ' + oldVals);
		 * });
		 * 
		 * var replaceList = new can.Observe.List(['Alexis', 'Bill']);
		 * replaceList.bind('change', function(ev, index, how, newVals, oldVals) {
		 *     console.log(index + ', ' + how + ', ' + newVals + ', ' + oldVals);
		 * });
		 * 
		 * attrList.attr(['Adam', 'Ben'], true);         // 0, set, Adam, Alexis
		 *                                               // 1, set, Ben, Bill
		 * replaceList.replace(['Adam', 'Ben']);         // 0, remove, undefined, ['Alexis', 'Bill']
		 *                                               // 0, add, undefined, ['Adam', 'Ben']
		 * 
		 * attrList.attr(['Amber'], true);               // 0, set, Amber, Adam
		 *                                               // 1, remove, undefined, Ben
		 * replaceList.replace(['Amber']);               // 0, remove, undefined, ['Adam', 'Ben']
		 *                                               // 0, add, Amber, ['Adam', 'Ben']
		 * 
		 * attrList.attr(['Alice', 'Bob', 'Eve'], true); // 0, set, Alice, Amber
		 *                                               // 1, add, ['Bob', 'Eve'], undefined
		 * replaceList.replace(['Alice', 'Bob', 'Eve']); // 0, remove, undefined, Amber
		 *                                               // 0, add, ['Alice', 'Bob', 'Eve'], Amber
		 * @codeend
		 */
		replace : function(newList) {
			if(can.isDeferred(newList)) {
				newList.then(can.proxy(this.replace, this));
			} else {
				this.splice.apply(this, [0, this.length].concat(can.makeArray(newList || [])));
			}

			return this;
		}
	});

	can.List = Observe.List = list;
	Observe.setup = function(){
		can.Construct.setup.apply(this, arguments);
		// I would prefer not to do it this way. It should
		// be using the attributes plugin to do this type of conversion.
		this.List = Observe.List({ Observe : this }, {});
	}
	return Observe;
});
