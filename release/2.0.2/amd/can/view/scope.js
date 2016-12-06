/*!
 * CanJS - 2.0.2
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Thu, 14 Nov 2013 18:45:10 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/construct", "can/map", "can/list", "can/view", "can/compute"], function(can){
	
	var isObserve = function(obj) {
		return obj instanceof can.Map || (obj && obj.__get);
	},
		getProp = function(obj, prop){
			var val = obj[prop];
	
			if(typeof val !== "function" && obj.__get) {
				return obj.__get(prop);
			}
			else {
				return val;
			}
		},
		escapeReg = /(\\)?\./g,
		escapeDotReg = /\\\./g,
		getNames = function(attr){
			var names = [], last = 0;
			attr.replace(escapeReg, function($0, $1, index) {
				if (!$1) {
					names.push(attr.slice(last, index).replace(escapeDotReg,'.'));
					last = index + $0.length;
				}
			});
			names.push(attr.slice(last).replace(escapeDotReg,'.'));
			return names;
		}
	

	
	var Scope = can.Construct.extend({
		// reads properties from a parent.  A much more complex version of getObject.
		/**
		 * @param {can.Map|can.compute} parent A parent observe to read properties from
		 * @param {Array<String>} reads An array of properties to read
		 * @param {can.view.Scope.ReadOptions}
		 */
		//
		/**
		 * @typedef {{}} can.view.Scope.ReadOptions
		 * 
		 * @option {function(can.compute|can.Map,Number)} [foundObservable(observe, readIndex)] Is called when the first observable is found.
		 * 
		 * @option {function(can.compute|can.Map,Number)} [earlyExit(observe, readIndex)] Is called if a value is not found.
		 * 
		 * @option {Boolean} [isArgument] If true, and the last value is a function or compute, returns that function instead of calling it.
		 * 
		 * @option {Array} args An array of arguments to pass to observable prototype methods. 
		 * 
		 * @option {Boolean} [returnObserveMethods] If true, returns methods found on an observable.
		 * 
		 * @option {Boolean} [proxyMethods=true] Set to false to return just the function, preventing returning a function that
		 * always calls the original function with this as the parent. 
		 */
		read: function(parent, reads, options){
			options = options || {};
			// `cur` is the current value.
			var cur = parent,
				type,
				// `prev` is the object we are reading from.
				prev,
				// `foundObs` did we find an observable.
				foundObs;
			for( var i = 0, readLength = reads.length ; i < readLength; i++ ) {
				// Update what we are reading from.
				prev = cur;
				// Read from the compute. We can't read a property yet.
				if( prev && prev.isComputed ) {
					options.foundObservable && options.foundObservable(prev, i)
					prev = prev()
				}
				// Look to read a property from something.
				if( isObserve(prev) ) {
					!foundObs && options.foundObservable && options.foundObservable(prev, i);
					foundObs = 1;
					// is it a method on the prototype?
					if(typeof prev[reads[i]] === "function" && prev.constructor.prototype[reads[i]] === prev[reads[i]] ){
						// call that method
						if(options.returnObserveMethods){
							cur = cur[reads[i]]
						} else {
							cur = prev[ reads[i] ].apply(prev, options.args ||[])
						}
						
					} else {
						// use attr to get that value
						cur = cur.attr( reads[i] );
					}
					
				} else {
					// just do the dot operator
					cur = prev[reads[i]]
				}
				// If it's a compute, get the compute's value
				// unless we are at the end of the 
				if( cur && cur.isComputed && (!options.isArgument && i < readLength - 1) ) {
					!foundObs && options.foundObservable && options.foundObservable(prev, i+1)
					cur = cur()
				}
				
				type = typeof cur;
				// if there are properties left to read, and we don't have an object, early exit
				if( i < reads.length -1 && ( cur == null || (type != "function" && type != "object" ) ) ) {
					options.earlyExit && options.earlyExit(prev, i, cur);
					// return undefined so we know this isn't the right value
					return {value: undefined, parent: prev};
				}
			}
			// if we don't have a value, exit early.
			if( cur === undefined ){
				options.earlyExit && options.earlyExit(prev, i - 1)
			}
			// handle an ending function
			if(typeof cur === "function"){
				if( options.isArgument ) {
					if( ! cur.isComputed && options.proxyMethods !== false) {
						cur = can.proxy(cur, prev)
					}
				} else {
					
					cur.isComputed && !foundObs && options.foundObservable && options.foundObservable(cur, i)
					
					
					cur = cur.call(prev)
				}
				
			}
			return {value: cur, parent: prev};
		}
	},{
		init: function(data, parent){
			this._data = data;
			this._parent = parent;
		},
		attr: function(attr){
			return this.read(attr,{isArgument: true, returnObserveMethods:true, proxyMethods: false}).value

		},
		add: function(data){
			if(data !== this._data){
				return new this.constructor( data, this );
			} else {
				return this;
			}
		},
		/**
		 * @function an.view.Scope.prototype.computeData
		 * 
		 * Returns an object that has a compute that represents reading this path. When the 
		 * compute is called, it caches the read data so that future reads are faster and
		 * sets data on that object so can.Mustache can make some decisions. The compute
		 * is writable too.
		 * 
		 * @param {can.Mustache.key} attr A dot seperated path.  Use `"\."` if you have a property name that includes a dot. 
		 * @param {can.view.Scope.ReadOptions} [options] that configure how this gets read.
		 * 
		 * @return {}
		 * 
		 * @option {can.compute} compute
		 * @option {can.view.Scope} scope
		 * @option {*} initialData
		 */
		computeData: function(attr, options ){
			options = options || {args: []};
			var self = this,
				rootObserve,
				rootReads,
				computeData = {
					compute: can.compute(function(newVal){
						if(arguments.length){
							// check that there's just a compute with nothing from it ...
							if(rootObserve.isComputed && !rootReads.length){
								rootObserve(newVal)
							} else {
								var last = rootReads.length-1;
								Scope.read(rootObserve,rootReads.slice(0, last)).value.attr(rootReads[last], newVal)
							}
						} else {
							if( rootObserve ) {
								return Scope.read(rootObserve, rootReads,  options).value
							}
							// otherwise, go get the value
							var data = self.read(attr, options);
							rootObserve = data.rootObserve;
							rootReads = data.reads;
							computeData.scope = data.scope;
							computeData.initialValue = data.value;
							return data.value;
						}
					})
				};
			return computeData
			
		},
		/**
		 * @function can.view.Scope.prototype.read
		 * 
		 * Read a key value from the scope and provide useful information
		 * about what was found along the way.
		 * 
		 * 
		 * @param {can.Mustache.key} attr A dot seperated path.  Use `"\."` if you have a property name that includes a dot. 
		 * @param {can.view.Scope.ReadOptions} options that configure how this gets read.
		 * 
		 * @return {} 
		 * 
		 * @option {*} value the found value
		 * 
		 * @option {Object} parent the value's immediate parent
		 * 
		 * @option {can.Map|can.compute} rootObserve the first observable to read from.
		 * 
		 * @option {Array<String>} reads An array of properties that can be used to read from the rootObserve to get the value.
		 */
		read : function(attr, options){
			
			// check if we should be running this on a parent.
			if( attr.substr(0,3) === "../" ) {
				return this._parent.read( attr.substr(3), options )
			} else if(attr == ".."){
				return {value: this._parent._data}
			} else if(attr == "." || attr == "this"){
				return {value: this._data};
			}
			
			// Split the name up.
			var names = attr.indexOf('\\.') == -1 
				// Reference doesn't contain escaped periods
				? attr.split('.')
				// Reference contains escaped periods (`a.b\c.foo` == `a["b.c"].foo)
				: getNames(attr),
				namesLength = names.length,
				j,
				// The current context (a scope is just data and a parent scope).
				context,
				// The current scope.
				scope = this,
				// While we are looking for a value, we track the most likely place this value will be found.  
				// This is so if there is no me.name.first, we setup a listener on me.name.
				// The most likely canidate is the one with the most "read matches" "lowest" in the
				// context chain.
				// By "read matches", we mean the most number of values along the key.
				// By "lowest" in the context chain, we mean the closest to the current context.
				// We track the starting position of the likely place with `defaultObserve`.
				defaultObserve,
				// Tracks how to read from the defaultObserve.
				defaultReads = [],
				// Tracks the highest found number of "read matches".
				defaultPropertyDepth = -1,
				// `scope.read` is designed to be called within a compute, but
				// for performance reasons only listens to observables within one context.
				// This is to say, if you have me.name in the current context, but me.name.first and
				// we are looking for me.name.first, we don't setup bindings on me.name and me.name.first.
				// To make this happen, we clear readings if they do not find a value.  But,
				// if that path turns out to be the default read, we need to restore them.  This
				// variable remembers those reads so they can be restored.
				defaultComputeReadings,
				// Tracks the default's scope.
				defaultScope,
				// Tracks the first found observe.
				currentObserve,
				// Tracks the reads to get the value for a scope.
				currentReads;
				
			// While there is a scope/context to look in.
			while(scope){
				
				// get the context
				context = scope._data;

				if (context != null) {
					
					
					// Lets try this context
					var data = Scope.read(context, names, can.simpleExtend({
						// Called when an observable is found.
						foundObservable: function(observe, nameIndex){
							// Save the current observe.
							currentObserve = observe;
							currentReads = names.slice(nameIndex);
						},
						// Called when we were unable to find a value.
						earlyExit: function(parentValue, nameIndex){
							// If this has more matching values,
							if(nameIndex > defaultPropertyDepth) {
								// save the state.
								defaultObserve = currentObserve;
								defaultReads = currentReads;
								defaultPropertyDepth = nameIndex;
								defaultScope = scope;
								// Clear and save readings so next attempt does not use these readings
								defaultComputeReadings = can.__clearReading && can.__clearReading();
							}
							
						}
					}, options));
					
					// Found a matched reference.
					if (data.value !== undefined ) {
						return {
							scope: scope,
							rootObserve: currentObserve,
							value: data.value,
							reads: currentReads
						}; 
					} 
				}
				// Prevent prior readings.
				can.__clearReading && can.__clearReading();
				// Move up to the next scope.
				scope = scope._parent;
			}
			// If there was a likely observe.
			if( defaultObserve ) {
				// Restore reading for previous compute
				can.__setReading && can.__setReading(defaultComputeReadings)
				return {
					scope: defaultScope,
					rootObserve: defaultObserve,
					reads: defaultReads,
					value: undefined
				}
			} else {
				// we found nothing and no observable
				return {
					names: names,
					value: undefined
				};
			}
			
		}
	});
	can.view.Scope = Scope;
	return Scope;
	
});